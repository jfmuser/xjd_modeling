import { createProject, fullUpdateGraph, initNode, createGraph, addProjectNode, addProjectDatatable } from '@/apis/secretflow/secretflow.api.js'

export default function useSecretflowFn() {

    async function createSecretflowProject(projectName, nodeTag) {
        console.log(nodeTag, 'NODETAG')
        const { projectId } = await createProject({ name: projectName, computeMode: 'MPC', teeNodeId: false })
        for (let i = 0; i < nodeTag.length; i++) {
            await addProjectNode({ nodeId: nodeTag[i], projectId })
        }
        // for (let i = 0; i < nodeTag.length; i++) {
        //     await initNode({ instId: nodeTag[i], projectId })
        // }
        const { graphId } = await createGraph({ name: '自定义训练流', templateId: 'blank', projectId })
        await fullUpdateGraph({
            edges: [],
            graphId,
            nodes: [],
            projectId
        })
        const projectInfo = { projectName, nodeTag, projectId, graphId }
        projectInfo.projectId = projectId
        projectInfo.graphId = graphId
        localStorage.setItem('projectInfo', JSON.stringify(projectInfo));
        return { projectId, graphId }
    }


    return {
        createSecretflowProject
    }
}