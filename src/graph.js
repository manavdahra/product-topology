function loadGraphData(data) {
    const dataset = { nodes: [], links: [] };
    const nodeIds = {};
    for (let i = 1; i < data.length; i++) {
        const source = data[i][0];
        const target = data[i][1];

        if (source == "" || target == "") continue;

        const sourceId = source.split("|")[0];
        const sourceCode = source.split("|")[1];
        const targetId = target.split("|")[0];
        const targetCode = target.split("|")[1];

        if (sourceId == "" || targetId == "") continue;

        let node = { id: sourceId, code: sourceCode, isRoot: false };
        if (sourceId in nodeIds) {
            node = nodeIds[sourceId];
            node.isRoot = false;
        }
        nodeIds[sourceId] = node;

        node = { id: targetId, code: targetCode, isRoot: true };
        if (targetId in nodeIds) {
            node = nodeIds[targetId];
        }
        nodeIds[targetId] = node;

        dataset.links.push({ source: sourceId, target: targetId });
    }

    dataset.nodes = Object.keys(nodeIds).map(id => {
        return { ...nodeIds[id], collapsed: nodeIds[id].isRoot, childLinks: [] };
    });
    return dataset;
}

export default loadGraphData;