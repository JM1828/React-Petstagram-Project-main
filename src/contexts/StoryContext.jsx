import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import StoryService from "../components/service/StoryService";

const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [readStories, setReadStories] = useState([]);
    const [readStatus, setReadStatus] = useState({});
    const [groupedStories, setGroupedStories] = useState({});

    /* 모든 스토리 fetch */
    const fetchStories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedStories = await StoryService.getStories();
            setStories(fetchedStories);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /* 특정 회원 스토리 fetch */
    const fetchUserStories = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const fetchedStories = await StoryService.getUserStories(userId);
            setStories(fetchedStories);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /* 스토리 업로드 */
    const uploadStory = useCallback(
        async (formData) => {
            setLoading(true);
            setError(null);
            try {
                await StoryService.uploadStory(formData);
                await fetchStories();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchStories]
    );

    /* 스토리 읽음 처리 */
    const setReadStory = useCallback(
        async (storyId, userId) => {
            try {
                await StoryService.markStoryAsRead(storyId, userId);
                await fetchStories();
            } catch (err) {
                setError(err.message);
            }
        },
        [fetchStories]
    );

    /* 특정 스토리 읽음 여부 확인 */
    const checkIfStoryIsRead = useCallback(async (storyId, userId) => {
        try {
            const isRead = await StoryService.isStoryRead(storyId, userId);
            return isRead;
        } catch (err) {
            setError(err.message);
        }
    }, []);

    /* 사용자별 스토리 읽음 상태 fetch */
    const fetchReadStatus = useCallback(async (groupedStories, profileId) => {
        const status = {};
        for (let userId in groupedStories) {
            for (let story of groupedStories[userId]) {
                const isRead = await checkIfStoryIsRead(story.id, profileId);
                status[story.id] = isRead;
            }
        }
        setReadStatus(status);
        return status;
    }, [checkIfStoryIsRead]);

    /* 현재 사용자(로그인)가 읽은 스토리 목록 fetch */
    const fetchUserReadStories = useCallback(async (userId) => {
        try {
            const readStories = await StoryService.getUserReadStories(userId);
            setReadStories(readStories);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    /* 스토리를 작성자별로 그룹화 */
    useEffect(() => {
        const grouped = stories.reduce((acc, story) => {
            const userId = story.user.id;
            if (!acc[userId]) {
                acc[userId] = [];
            }
            acc[userId].push(story);
            return acc;
        }, {});
        setGroupedStories(grouped);
    }, [stories]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    return (
        <StoryContext.Provider
            value={{
                stories,
                loading,
                error,
                fetchUserStories,
                uploadStory,
                setReadStory,
                checkIfStoryIsRead,
                fetchUserReadStories,
                readStories,
                readStatus,
                fetchReadStatus,
                groupedStories,
            }}
        >
            {children}
        </StoryContext.Provider>
    );
};

export { StoryContext };
