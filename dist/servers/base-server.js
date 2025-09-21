export class BaseMCPServer {
    name;
    tools = [];
    constructor(name) {
        this.name = name;
    }
    async initialize() {
        // Override in subclasses
    }
    async getTools() {
        return this.tools;
    }
    createSuccessResponse(data) {
        return {
            content: [{
                    type: 'text',
                    text: typeof data === 'string' ? data : JSON.stringify(data)
                }]
        };
    }
    createErrorResponse(error) {
        const errorResponse = {
            success: false,
            error: {
                message: error.message,
                type: error.constructor.name,
                timestamp: new Date().toISOString()
            }
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(errorResponse)
                }]
        };
    }
}
