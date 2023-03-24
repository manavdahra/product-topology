import ForceGraph3D from '3d-force-graph';
import loadGraphData from './graph.js';
import graphData from './graph_data.csv';

const dataset = loadGraphData(graphData);

function strToRGB(str) {
    let stringUniqueHash = [...str].reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
}

// link parent/children
const nodesById = Object.fromEntries(dataset.nodes.map(node => [node.id, node]));
dataset.links.forEach(link => {
    nodesById[link.target].childLinks.push(link);
});

// cross-link node objects
dataset.links.forEach(link => {
    const a = nodesById[link.source];
    const b = nodesById[link.target];
    !a.neighbors && (a.neighbors = []);
    !b.neighbors && (b.neighbors = []);
    a.neighbors.push(b);
    b.neighbors.push(a);

    !a.links && (a.links = []);
    !b.links && (b.links = []);
    a.links.push(link);
    b.links.push(link);
});

const highlightNodes = new Set();
const highlightLinks = new Set();
let hoverNode = null;

const roots = Object.keys(nodesById)
    .filter(id => nodesById[id].isRoot)
    .map(id => nodesById[id]);

const getPrunedTree = (roots) => {
    const visibleNodes = [];
    const visibleLinks = [];

    for (let i = 0; i < roots.length; i++) {
        (function traverseTree(node = roots[i]) {
            visibleNodes.push(node);
            if (node.collapsed) return;
            visibleLinks.push(...node.childLinks);
            node.childLinks
                .map(link => ((typeof link.source) === 'object') ? link.source : nodesById[link.source]) // get child node
                .forEach(traverseTree);
        })(); // IIFE
    }

    return { nodes: visibleNodes, links: visibleLinks };
};
const elem = document.createElement('div');
document.body.appendChild(elem);

const Graph = ForceGraph3D({ controlType: 'fly' })(elem)
    .onNodeClick(node => {
        node.fx = node.x;
        node.fy = node.y;
        const recipeUrl = `https://staging-operations.hellofresh.com/culinary/recipes/gb/${node.id}/edit?language=en-GB`;
        window.open(recipeUrl).focus();
        if (node.childLinks.length == 0) return
        roots.forEach(n => {
            if (n.id == node.id) {
                n.collapsed = !n.collapsed; // toggle collapse state
            }
        })
        Graph.graphData(getPrunedTree(roots));
    })
    .nodeColor(node => highlightNodes.has(node) ? node === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : strToRGB(node.code))
    .linkWidth(link => highlightLinks.has(link) ? 2 : 1)
    .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
    .linkDirectionalParticleWidth(2)
    .nodeLabel(node => node.code)
    .linkOpacity(0.5)
    .onNodeDragEnd(node => {
        node.fx = node.x;
        node.fy = node.y;
    })
    .onNodeRightClick(node => {
        node.fx = node.x;
        node.fy = node.y;
    })
    .onNodeHover(node => {
        // no state change
        if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
        }

        hoverNode = node || null;

        updateHighlight();
    })
    .onLinkHover(link => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        updateHighlight();
    })
    .d3VelocityDecay(0.3)
    .graphData(getPrunedTree(roots));

Graph.d3Force('link').distance(35);
Graph.d3Force('charge').strength(-10);

function updateHighlight() {
    // trigger update of highlighted objects in scene
    Graph
        .nodeColor(Graph.nodeColor())
        .linkWidth(Graph.linkWidth())
        .linkDirectionalParticles(Graph.linkDirectionalParticles());
}