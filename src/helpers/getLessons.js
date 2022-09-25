import apiCall from './apiCall';
import { TaskQueue } from 'cwait';

export const getLessons = async (courseId) => {
    const queue = new TaskQueue(Promise, 3); // limit number of requests to send concurrently

    var t0 = performance.now();

    try {
        const { success, response, message } = await apiCall('GET', `/users/courses/${courseId}/chapters`);

        const { chapters } = response;
        const requiredData = [];
        const testData = [];
        const lessons = [];

        if (success) {
            let urls = [];
            chapters.map((chapter) => {
                let url = `/users/chapters/${chapter._id}/lessons`;
                urls.push(url);
            });

            await Promise.all(
                urls.map(
                    queue.wrap(async (url) => {
                        const { response } = await apiCall('GET', url);
                        lessons.push(response);
                    })
                )
            );

            chapters.map((chapter) => {
                lessons.map((res) => {
                    if (res.docs[0].userChapterId == chapter._id) {
                        requiredData.push([chapter, res]);
                    }
                });
            });
        }

        const compare = (a, b) => {
            if (a[0].menuIndex < b[0].menuIndex) {
                return -1;
            }
            if (a[0].menuIndex > b[0].menuIndex) {
                return 1;
            }
            return 0;
        };

        requiredData.sort(compare);

        var t1 = performance.now();
        return requiredData;
    } catch (err) {}
};
