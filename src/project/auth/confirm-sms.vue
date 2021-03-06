<template lang="jade">
div
  .signup.confirm(:style='{ height: height }')
    .signup__close.__hello(@click='closePage'): i.ic-close
    .section
      h1 Подтвердите номер телефона
      .middle-container
        template(v-if='isCompleted')
          h1 Спасибо!
        template(v-else)
          p(v-if='!isCompleted',
            :class='{ error: errorCode }') {{ text_header }}
          .input-container
            .input.confirm-input
              input(type='tel',
                @keyup='onInput',
                @focus='onFocus',
                @keydown.enter='onButton()',
                v-el:confirm-field,
                v-model='code',
                placeholder='9999',
                autocomplete="off",
                autocorrect="off",
                autocapitalize="off",
                spellcheck="false")

      .bottom-container.__fixed-width
          .btn-container
            button.btn.btn_primary.__orange.__xl.fast__big__btn.btn_fixed-bottom(
              :disabled='isDisabled',
              v-el:confirm-btn,
              @keydown.enter='onButton()',
              @click='onButton') {{ isCompleted ? 'Продолжить' : 'Подтвердить' }}
            .link-container
              a.link-bottom(href='#',
                v-if='!isCompleted',
                v-show='needNewSMS'
                @click.prevent='sendSMS') Отправить новый код
</template>

<script type="text/babel">

  import { executeCallbackOnSuccessAuth } from 'vuex/actions';
  import { authUser } from 'vuex/actions/user.js';
  import { authData, callbackOnSuccessAuth } from 'vuex/getters';
  import store from 'vuex/store';
  import * as auth from 'services/auth';

  const TEXT_HEADER = {
    DEFAULT: 'Введите код из sms',
    ERROR: 'Ошибка, попробуйте снова',
  };

  export default {
    data(){
      return {
        code: '',
        errorCode: false,
        isCompleted: false,
        height: '',
        text_header: TEXT_HEADER.DEFAULT,
        needNewSMS: false,
      };
    },

    route: {
      canActivate({abort}){
        if (!authData(store.state).phone && !authData(store.state).username) {
          abort();
        }
        return true;
      }
    },

    ready() {
      this.$set('height', `${ document.body.scrollHeight }px`);
      this.$els.confirmField.focus();
    },

    vuex: {
      actions: {
        authUser,
        executeCallbackOnSuccessAuth,
      },
      getters: {
        authData,
        callbackOnSuccessAuth,
      }
    },

    computed: {
      isDisabled() {
        return (this.code.length !== 4) && !this.isCompleted;
      },
    },

    methods: {
      // input only numbers
      onInput(e) {
        this.code = this.code.replace(/[^0-9]/g, '');

        if (this.code.length >= 4) {
          this.code = this.code.slice(0, 4);
        }
      },

      onButton() {

        if (this.isDisabled) {
          return;
        }

        if (!this.isCompleted) {
          this.onConfirm();
          setTimeout( () => this.$set('needNewSMS', true), 7000);
        }
      },

      onConfirm() {
        auth.confirmByCode( this.authData.phone, this.code)
        .then( ({ user, token }) => {
          this.onComplete(user, token);
        }).catch( error => {
          if (error === auth.ERROR_CODES.WRONG_CREDENTIALS) {
            this.onErrorCode();
          }
        })
      },

      onComplete(user, token) {
        this.isCompleted = true;
        this.$els.confirmBtn.focus();

        this
          .authUser(user, token)
          .then(() => {

            if (!this.callbackOnSuccessAuth) {
              setTimeout( () => this.$router.go({name: 'home'}), 1000);
            } else {
              this.executeCallbackOnSuccessAuth()
            }

          });

      },

      onErrorCode() {
        console.log('on error');
        this.$set('errorCode', true);
        this.$set('text_header', TEXT_HEADER.ERROR);
        this.$set('code', '');
      },

      onFocus() {
        if (this.$get('errorCode')) {
          this.$set('errorCode', false);
          this.$set('text_header', TEXT_HEADER.DEFAULT);
        }
      },

      sendSMS() {
        this.onFocus();
        this.$set('code', '');
        this.$set('needNewSMS', false);
        setTimeout( () => this.$set('needNewSMS', true), 7000);

        auth.sendPassword(this.authData.phone).then( data => {
          this.$router.go({ name: 'comfirm-sms' })
        })

      },

      closePage() {
        mixpanel.track('Close confirm-sms Page');

        if (window.history.length > 2) {
          this.$router.go(window.history.back(2));
        } else {
          this.$router.go({name: 'home'});
        }
      },
    },
  }
</script>
