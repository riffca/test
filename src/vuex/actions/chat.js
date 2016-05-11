import {
	RECEIVE_MESSAGE,
	LOAD_MESSAGE,
	SET_CONVERSATION,
	UPDATE_CHAT_MEMBERS,
	SET_SHOW_MENU,
	SET_SHOW_STATUS_MENU,
	CLOSE_CONVERSATION,
	SET_STATUS
} from '../mutationTypes/conversation';

import * as messageService from 'services/message.js';
import * as leads from 'services/leads.js';
import * as chat from 'services/chat.js';
import messageCache from 'cache/message';
import { getCurrentMember, getId, getLastMessageId } from 'vuex/getters/chat.js';

export const setConversation = ( { dispatch }, id ) => {

	const promise = leads.get( { lead_id: id } );

	promise.then( ( { messages, lead, error } ) => {

		if (error !== null) {
			
			if (error.code === leads.ERROR_CODES.FORBIDDEN) {

				return chat.join( { lead_id: id } ).then(
					() => {

					return setConversation({ dispatch }, id);

					},
					( error ) => {
						console.log( `Join to chat error: ${(leads.ERROR_CODES.FORBIDDEN === error) ? '[ FOBIDDEN ]' : ''}` );
					}
				);

			}
			
		}

		if (messages !== null) {

			const lastMessageId = messages[ messages.length - 1 ].id;

			messageCache.init( lead.id, messages );

			dispatch( SET_CONVERSATION, lead.id, lead.chat.members, messages, lead, lastMessageId );

			return messageService.update(id, lastMessageId);

		}
		dispatch( SET_CONVERSATION, lead.id, [], [], lead, null );
	} );

	promise.catch( (error) => {
		console.log( `Set conversation error: ${(leads.ERROR_CODES.FORBIDDEN === error) ? '[ FOBIDDEN ]' : ''}` );
	} );

	return promise;
};

export const loadMessage = ( { dispatch, state:{ conversation:{ id, messages } } } ) => {

	const promise = messageService.find( id, messages[ 0 ].id );

	promise.then( ( messages ) => {
		if ( messages !== null ) {
			dispatch( LOAD_MESSAGE, messages );
		}
	} );

	promise.catch( ( error ) => {
		console.log( error );
	} );

	return promise;

};

export const createMessage = ( store, conversation_id, text, mime_type ) => {
	return messageService.create( conversation_id, text, mime_type );
};

export const receiveMessage = ( { dispatch, state }, chat, messages ) => {

	return new Promise( ( resolve, reject ) => {

		let count = messages.length;

		if(count > 0) {

			const msg = messages[count - 1];
			const isNotLastMessage = getLastMessageId(state) !== msg.id;

			if(isNotLastMessage) {

				messageService.update(msg.conversation_id, msg.id).then(() => {

					messageCache.addReceiveMessage( msg.conversation_id, messages );

					dispatch( RECEIVE_MESSAGE, messages );

					resolve();

				}, reject);

			} else {

				resolve();

			}

		}

	} );

};

export const updateMembers = ( { dispatch, state }, user_id, chat ) => {

	let isCurrentChat    = chat.id === getId( state );
	let isNotCurrentUser = user_id !== getCurrentMember( state ).user_id;

	if ( isCurrentChat && isNotCurrentUser ) {

		dispatch( UPDATE_CHAT_MEMBERS, chat.members );

	}

};

export const applyStatus = ({ dispatch }, status) => {
	dispatch(SET_STATUS, status);
};

export const setStatus = ( { dispatch, state:{conversation:{lead:{id}}} }, status ) => {
	return new Promise((resolve, reject) => {
		leads.setEvent(id, status).then( ({status}) => {
			dispatch(SET_STATUS, status);
			resolve(status);
		}).catch( error => {
			reject(error);
		});
	});
};

export const setShowMenu = ( { dispatch }, showMenu ) => {
	dispatch(SET_SHOW_MENU, showMenu);
};

export const setShowStatusMenu = ( { dispatch }, showStatusMenu ) => {
	dispatch(SET_SHOW_STATUS_MENU, showStatusMenu);
};

export const closeConversation = ({ dispatch }) => {
	dispatch(CLOSE_CONVERSATION);
};