<style src='./style.pcss' scoped></style>
<template lang="jade">
.payment.pay-on
  a(href='#').close
    i.ic-close
  .bottom-margin
    .payment-wrapper
      .payment-head Оплата на карту#[br]  продавца
      span.transaction card2card транзакция
      .payment-result
        .for-pay
          .payment-result-pay-label К оплате
          | 9 7 8 0 &#8381;
        i.plus +
        .commission
          .payment-result-pay-label Комиссия
          | 0  &#8381;

      .check-card
        .check-card-text Выберите карту,#[br]  с которой будут списаны деньги
        .check-card-select-wrap
          i.ic-check-card
          select.check-card-select
            option Новая карта
            option Новая карта 2
        .check-card-input-wrap
          .check-card-input
            i.ic-card-new
            input(name='code' placeholder='1234' type='text').code
            input(name='date' placeholder='MM/YY' type='text').date
            input(name='cvc' placeholder='CVC' type='text').cvc
        .check-card-input-wrap
            .check-card-input.big
              i.ic-user-navbar
              input(name='name' placeholder='Имя и фамилия как на карте' type='text').name

      p.payment-note Прямая оплата на карту продавцу#[br]  через платежный сервис Payture.ru#[br]  Данные защищены.

  .btn-container
    button.btn.btn_primary.__orange.__xl.fast__big__btn.btn_fixed-bottom Оплатить
</template>
<script>
    export default{

    }
</script>
