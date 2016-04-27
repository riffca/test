<template lang="jade">
div
  .signup.confirm(:style="{ height: height }")
    .info__close.__hello(@click="closePage"): i.ic-close
    .section
      h1 Подтвердите номер телефона
      .middle-container
        template(v-if="isCompleted")
          h1 Спасибо!
        template(v-else)
          p(v-if="!isCompleted",
            :class="{ error: errorCode }") {{ text_header }}
          .input-container
            .input.confirm-input
              input(type="tel",
                @keypress="onInput",
                @focus="onFocus",
                @keydown.enter="onButton()",
                v-el:confirm-field,
                v-model="code",
                placeholder="9999")

      .bottom-container.__fixed-width
        .btn-container
          button.btn.btn_primary.__orange.__xl.fast__big__btn(
            :disabled="isDisabled",
            v-el:confirm-btn,
            @keydown.enter="onButton()",
            @click="onButton") {{ isCompleted ? 'Продолжить' : 'Подтвердить' }}
          .link-container
            a.link-bottom(href="#",
              v-if="!isCompleted",
              v-show="needNewSMS"
              @click.prevent="sendSMS") Отправить новый код
</template>

<script>
  import {
    hidePopupFastSignup,
    authenticateUser,
  } from 'vuex/actions';
  import {
    authData,
  } from 'vuex/getters';
  import store from 'vuex/store';
  import * as auth from 'services/auth';

  const TEXT_HEADER = {
    DEFAULT: 'Введите код из sms',
    ERROR: 'Ошибка, попробуйте снова',
  }

  export default {
    data: () => ({
      code: '',
      errorCode: false,
      isCompleted: false,
      height: '',
      text_header: TEXT_HEADER.DEFAULT,
      needNewSMS: false,
    }),

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
      this.hidePopupFastSignup();
      this.$els.confirmField.focus();
    },

    vuex: {
      actions: {
        authenticateUser,
        hidePopupFastSignup,
      },
      getters: {
        authData,
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
        if (!(e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
          e.preventDefault();
        }

        if (this.$get('code').length >= 4) {
          e.preventDefault();
        }
      },

      onButton() {
        if (this.isDisabled) {
          return;
        }
        if (this.isCompleted) {
          // go to back
          // this.closePage();
          // this.closePage();
          this.$router.go({name: 'home'});
        } else {
          this.onConfirm();
          setTimeout( () => this.$set('needNewSMS', true), 7000);
        }
      },

      onConfirm() {
        var config = { code: this.code };
        auth.confirmByCode(config).then( ({ user, token }) => {
          this.onComplete(user, token);
        }).catch( error => {
          if (error === auth.ERROR_CODES.WRONG_CREDENTIALS) {
            this.onErrorCode();
          }
        })
      },

      onComplete(user, token) {
        this.isCompleted = true;
        this.authenticateUser(user, token);
        this.$els.confirmBtn.focus();
      },

      onErrorCode() {
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

        auth.sendPassword(config.phone).then( data => {
          this.$router.go({ name: 'comfirm-sms' })
        })

      },

      closePage() {
        mixpanel.track("Close confirm-sms Page");

        if (window.history.length > 2) {
          this.$router.go(window.history.back(2));
        } else {
          this.$router.go({name: 'home'});
        }
      },
    },
  }
</script>