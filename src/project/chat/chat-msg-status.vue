<style src='./styles/chat-msg-date.pcss'></style>
<template lang="jade">
  .chat-row.__center(v-if="isHide && text !== null")
    .chat-msg-date
      span {{text}}

</template>

<script>
  import { getCurrentMember, getCustomerName } from 'vuex/getters/chat.js';
  import * as leads from 'services/leads';
  import { statusString } from './utils';

  export default{
    props: {
      msg: {
        type: Object,
        required: true
      }
    },
    vuex: {
      getters: {
        getCurrentMember,
        getCustomerName
      }
    },
    computed: {
      isHide(){

        if ( this.getCurrentMember !== null ) {

          const { type } = JSON.parse( this.msg.parts[ 0 ].content );

          return !( ( this.getCurrentMember.role === leads.USER_ROLES.CUSTOMER.key ) && ( type === 'suplier.called' ));

        }

      },
      text(){

        const { type, value } = JSON.parse( this.msg.parts[ 0 ].content );

        return statusString(type, value, this.getCustomerName);

      }
    }
  }
</script>
