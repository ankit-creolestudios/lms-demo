import apiCall from './apiCall';

const apiFile = async (fileId) => {
    if (fileId) {
        const { success, response } = await apiCall('GET', `/files/${fileId}`);

        if (success) {
            const { url } = response;

            if (Array.isArray(url)) {
                return url[1];
            }

            return url;
        }
    }

    return '';
};

export default apiFile;

export const apiFileFullResponse = async (fileId) => {
    if (fileId) {
        const { success, response } = await apiCall('GET', `/files/${fileId}`);

        return success ? response : null;
    } else {
        return null;
    }
};
