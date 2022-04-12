// File Name:    ApiUtilities.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

const serverIp = "https://localhost";
const serverPort = 5001;

const performHttpMethod = async (method, apiEndpoint, jsonRequestBody = null) => {
    let httpMethod = null;

    switch (method.trim().toLowerCase()) {
        case "delete":
            httpMethod = "DELETE";
            break;
        case "get":
            httpMethod = "GET";
            break;
        case "post":
            httpMethod = "POST";
            break;
        case "put":
            httpMethod = "PUT";
            break;
        default:
            throw new Error(`Invalid HTTP method: ${method}`);
    }

    const endpoint = `${getServerEndpoint()}/${apiEndpoint}`;
    let apiResponse;

    if (jsonRequestBody === null) {
        apiResponse = await fetch(endpoint, { method: httpMethod });
    } else {
        apiResponse = await fetch(endpoint, {
            method: httpMethod,
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ jsonRequestBody })
        });
    }

    return apiResponse.json();
}

const getServerEndpoint = () => {
    return `${serverIp}:${serverPort}`
}

export const httpGet = async (apiEndpoint) => {
    return await performHttpMethod("get", apiEndpoint);
}

export const httpInsert = async (apiEndpoint, jsonRequestBody) => {
    return await performHttpMethod("post", apiEndpoint, jsonRequestBody);
}

export const httpUpdate = async (apiEndpoint, jsonRequestBody) => {
    return await performHttpMethod("put", apiEndpoint, jsonRequestBody);
}

export const httpDelete = async (apiEndpoint, jsonRequestBody) => {
    return await performHttpMethod("delete", apiEndpoint, jsonRequestBody);
}
