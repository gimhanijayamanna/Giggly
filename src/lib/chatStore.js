import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    isDetailVisible: false,
    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;
        //check if current user is blocked
        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }

        //check if receiver is blocked
        else if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user: user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        }
        else {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },
    changeBlock: () => {
        set(state => {
            const currentUser = useUserStore.getState().currentUser;

            if (!currentUser || !state.user) return state;

            // Update current user's blocked array in the store
            const updatedCurrentUser = { ...currentUser };

            // If currently the receiver is blocked, unblock them
            if (state.isReceiverBlocked) {
                // Remove user from blocked list
                updatedCurrentUser.blocked = currentUser.blocked.filter(id => id !== state.user.id);

                // Update user store with new blocked list
                useUserStore.setState({ currentUser: updatedCurrentUser });

                return {
                    ...state,
                    isReceiverBlocked: false,
                    isCurrentUserBlocked: false,
                };
            }
            // If no one is blocked, block the receiver
            else {
                // Add user to blocked list
                updatedCurrentUser.blocked = [...(currentUser.blocked || []), state.user.id];

                // Update user store with new blocked list
                useUserStore.setState({ currentUser: updatedCurrentUser });

                return {
                    ...state,
                    isReceiverBlocked: true,
                    isCurrentUserBlocked: false,
                };
            }
        });
    },
    toggleDetail: () => {
        set(state => ({ ...state, isDetailVisible: !state.isDetailVisible }));
    },
    hideDetail: () => {
        set(state => ({ ...state, isDetailVisible: false }));
    }
}))