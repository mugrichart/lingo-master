
type FetchTopicsQuery = {
    parent?: string, // parent topic
    creator?: string, // creator id
    myLearning?: string, // topic learning data for this user
    language?: string,
}

export async function fetchTopics(query: FetchTopicsQuery = {}) {
    try {
        const queryParams = new URLSearchParams(query).toString()
        const response = await fetch(`http://localhost:3500/api/v1/topics?${queryParams}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching Topics')
    }
}

export async function fetchTopicByID(id: string) {
    try {
        const response = await fetch(`http://localhost:3500/api/v1/topics/${id}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching The topic')
    }
}