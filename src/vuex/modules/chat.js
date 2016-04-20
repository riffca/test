import {
  RECEIVE_CHAT,
  OPEN_CHAT,
  CLOSE_OPENED_CHAT,
  INCREMENT_CHAT_NOTIFY_COUNT,
  CLEAR_CHAT_NOTIFY_COUNT,
  RECEIVE_CHAT_MSG,
} from '../mutation-types';

// initial state
const state = {
  all: [
  /* {
        id: 0,
        members: [],
        messages: [],
   } */
  ],
  opened_id: null,
  notify_count: null,
};

// mutations
const mutations = {
  [RECEIVE_CHAT] (state, chat) {
    state.all.push(chat);
  },
  [OPEN_CHAT] (state, chat_id) {
    state.opened_id = chat_id;
  },
  [CLOSE_OPENED_CHAT] (state) {
    state.opened_id = null;
  },
  [INCREMENT_CHAT_NOTIFY_COUNT] (state) {
    state.notify_count += 1;
  },
  [CLEAR_CHAT_NOTIFY_COUNT] (state) {
    state.notify_count = 0;
  },
  [RECEIVE_CHAT_MSG](state, chat_id, msg) {
    state.all.forEach( chat => {
      if (chat.id === chat_id) {
        chat.messages.push(msg);
      }
    });
  },
};

export default {
  state,
  mutations
};
