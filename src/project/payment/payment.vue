<style src='./style.pcss' scoped></style>
<template lang="jade">
.payment
  a(href='#').close
    i.ic-close
  .bottom-margin
    .payment-wrapper
      .payment-head Выставите#[br]  счет на оплату
      .payment-summ
        .payment-summ-text Введите сумму к оплате
        .payment-summ-input-wrapper
          i.ic-rouble
          input(type='text' placeholder='0').payment-summ-input

      .check-card
        .check-card-text Выберите карту,#[br]  куда будут зачислены деньги
        .check-card-select-wrap
          i.ic-check-card
          select.check-card-select
            option Новая карта
            option Новая карта 2
        .check-card-input-wrap
          i.ic-card-new
          input(type='text' placeholder='0000 0000 0000 0000').check-card-input
      p.payment-note Деньги будут перечислены#[br]  прямо вам на карту с помощью#[br]  платежного сервиса Payture.ru

  .btn-container
    button.btn.btn_primary.__orange.__xl.fast__big__btn.btn_fixed-bottom Отправить
</template>
<script>
    export default{

    }
</script>
