import { userID } from 'vuex/getters/user.js'

export const getList = ( { products } ) => {

  if ( products.lists.hasOwnProperty( products.listId ) ) {

    return products.lists[ products.listId ];

  }

  return null;

};

export const getProducts = ( state ) => {

  const list = getList( state );

  if ( list !== null ) {

    return list.products;

  }

  return null;

};

/*
 export const getProduct = ( state, product_id ) => {

 const products = getProducts( state );

 if ( Array.isArray( products ) ) {

 const result = products.filter( ( { id } ) => id === product_id )[ 0 ];

 if ( typeof result === 'undefined' ) {

 return null;

 }

 return result;

 }

 return null;

 };
 */

export const getLastProduct = ( state ) => {

  const products = getProducts( state );

  if ( products !== null ) {

    return products[ products.length - 1 ];

  }

  return null;

};

export const getOpenedProduct = ( { products } ) => products.openedProduct;

export const getScrollTopOfProduct = ( { products } ) => {

  if ( products.openedProduct !== null ) {

    if ( products.openedProduct.hasOwnProperty( 'id' ) ) {

      if ( products.saveScrollByProduct.hasOwnProperty( products.openedProduct.id ) ) {

        return products.saveScrollByProduct[ products.openedProduct.id ];

      }

    }

  }

  return 0;

};

export const isLiked = ( state ) => {

  const product = getOpenedProduct( state );

  if ( product !== null ) {

    if ( product.hasOwnProperty( 'liked_by' ) ) {

      for ( let i = product.liked_by.length; i; i-- ) {

        if ( userID( state ) === product.liked_by[ i - 1 ].id ) {

          return true;

        }

      }

      return false;

    }

    return false;

  }

  return false;

};

export const hasMore = ( state ) => (getList( state ) !== null) ? getList( state ).hasMore : true;

export const getColumnCount = ( { products } ) => products.columnCount;

export const isLoading = ( { products } ) => products.loading;

export const isAnimateShow = ( state ) => {

  const list = getList( state );

  if ( list !== null ) {

    return list.animateShow;

  }

  return true;

};

export const callAfterLoading = ( state ) => {

  return state.products.callBackAfterLoading;

};

export const getComeBack = ( state ) => {

  return state.products.comeBack;

};

export const getScrollData = ( state ) => {

  const list = getList( state );

  if ( list !== null ) {

    return {
      searchOptions: list.searchOptions,
      isLoading: list.isLoading,
      scrollTop: list.scrollTop,
      scrollTopReal: list.scrollTopReal,
      rowHeight: list.rowHeight,
      lastScrollTop: list.lastScrollTop,
      direction: list.direction,
      shift: list.shift,
      topBlockHeight: list.topBlockHeight,
      bottomBlockHeight: list.bottomBlockHeight,
      idStart: list.idStart,
      idEnd: list.idEnd,
      landingIdStart: list.landingIdStart,
      landingIdEnd: list.landingIdEnd

    }

  }

  return {
    searchOptions: {},
    isLoading: false,
    scrollTop: 0,
    scrollTopReal: 0,
    rowHeight: 0,
    lastScrollTop: 0,
    direction: true,
    shift: true,
    topBlockHeight: 0,
    bottomBlockHeight: 0,
    idStart: 0,
    idEnd: 0,
    landingIdStart: 0,
    landingIdEnd: 0

  }

};

export const getCountElementOnPage = () => {

  return 27;

};
