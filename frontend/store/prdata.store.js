import {create} from 'zustand';

// Create a store
const usePRStore = create((set) => ({
    PRList: [],
    setPRList: (pr) => {
        set({PRList: pr})
    },
    isPRLoading: false,
    setIsPRLoading: (loading) => {
        set({isPRLoading: loading})
    },
}));

export default usePRStore;