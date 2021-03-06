import {
  PRODUCTS_RECEIVE,
  PRODUCTS_LOADING,
  PRODUCTS_UPDATE_LIKED_BY,
  PRODUCTS_SET_LIST_ID,
  PRODUCTS_SET_COLUMN_NUMBER,
  PRODUCTS_SET_SCROLL,
  PRODUCTS_SET_ANIMATE,
  PRODUCTS_FORCE_RECEIVE,
  PRODUCTS_SET_OPENED_PRODUCT,
  PRODUCTS_CLOSE,
  PRODUCTS_SET_CALL_BACK_AFTER_LOADING,
  PRODUCTS_SET_COME_BACK,
  PRODUCTS_SET_CONTAINER_WIDTH,
  PRODUCTS_RESET_SCROLL_BY_LIST_ID,
  PRODUCTS_SAVE_SCROLL_BY_PRODUCT
} from '../mutation-types';
import { getCountElementOnPage } from 'vuex/getters/products.js'
const columnCount    = document.body.offsetWidth <= 750 ? 2 : 3;
const ITEMS_PER_PAGE = getCountElementOnPage( {
  products: {
    columnCount
  }
} ) * 3;

// initial state
const state = {
  lists: {
    // "profile": {
    //   products: [],
    //   needLoadMore: false,
    //   animateShow: true,
    //   hasMore: true

    // Это нужно для расчёта сдвига.

    //   lastScrollTop: 0,
    //   direction: true,
    //   shift: true,

    // Это нужно для запроса данных.

    //   isLoading: false,
    //   searchOptions: {},

    // Это нужно для органи зации работа скрола.

    //   scrollTop: 0,
    //   scrollTopReal: 0,
    //   rowHeight: 0,
    //   topBlockHeight: 0,
    //   bottomBlockHeight: 0,
    //   idStart: 0,
    //   idEnd: 0,
    //   landingIdStart: 0,
    //   landingIdEnd: 0,

    // },
  },
  saveScrollByProduct:{

  },
  columnCount,
  listId: null,
  loading: true,
  ITEMS_PER_PAGE,
  openedProduct: null,
  callBackAfterLoading: () => {
  },
  comeBack: false,
  containerWidth: 0
};

// mutations
const mutations = {

  [PRODUCTS_SAVE_SCROLL_BY_PRODUCT] (state, scrollTop, productId){

    state.saveScrollByProduct = Object.assign({}, state.saveScrollByProduct, { [ productId ] : scrollTop });

    console.log();

  },

  [PRODUCTS_SET_CONTAINER_WIDTH] ( state, width ){

    state.containerWidth = width;

  },

  [PRODUCTS_FORCE_RECEIVE] ( state, products ) {

    if ( state.listId !== null ) {

      state.lists = Object.assign(
        {},
        state.lists,
        {
          [ state.listId ]: {
            products: Array.isArray( products ) ? products : [],
            needLoadMore: false,
            animateShow: true,
            hasMore: Array.isArray( products ) ? products.length >= ITEMS_PER_PAGE / 3 : false,

            lastScrollTop: 0,
            direction: true,
            shift: true,

            isLoading: false,
            searchOptions: {},

            scrollTop: 0,
            scrollTopReal: 0,
            rowHeight: 0,
            topBlockHeight: 0,
            bottomBlockHeight: 0,
            idStart: 0,
            idEnd: ITEMS_PER_PAGE,
            landingIdStart: 0,
            landingIdEnd: ITEMS_PER_PAGE

          }
        }
      );

    }

    state.loading = false;
  },

  [PRODUCTS_RECEIVE] ( state, products ) {

    if ( !state.lists.hasOwnProperty( state.listId ) ) {

      state.lists = Object.assign(
        {},
        state.lists,
        {
          [ state.listId ]: {

            products: [],
            needLoadMore: false,
            animateShow: true,
            hasMore: (Array.isArray( products )) ? products.length >= ITEMS_PER_PAGE / 3 : false,

            lastScrollTop: 0,
            direction: true,
            shift: true,

            isLoading: false,
            searchOptions: {},

            scrollTop: 0,
            scrollTopReal: 0,
            rowHeight: 0,
            topBlockHeight: 0,
            bottomBlockHeight: 0,
            idStart: 0,
            idEnd: ITEMS_PER_PAGE,
            landingIdStart: 0,
            landingIdEnd: ITEMS_PER_PAGE

          }
        }
      )

    }

    if ( Array.isArray( products ) ) {

      state.lists[ state.listId ].hasMore  = products.length >= ITEMS_PER_PAGE / 3;
      state.lists[ state.listId ].products = state.lists[ state.listId ].products.concat( products );

    } else {

      state.lists[ state.listId ].hasMore = false;

    }

    state.loading = false;

  },

  [PRODUCTS_SET_LIST_ID] ( state, listId = null ) {

    if ( listId !== null ) {

      state.listId = listId;

    }

  },

  [PRODUCTS_SET_OPENED_PRODUCT] ( state, product ) {

    state.openedProduct = product;

  },

  [PRODUCTS_UPDATE_LIKED_BY] ( state, product, user, like ) {

    /**
     * Если я лайкнул я просто одного себя ставлю в liked_by.
     * Всё ровно сейчас необходимо каждый раз запрашивать объект продукта.
     * */

    if ( state.openedProduct !== null ) {

      if ( like ) {

        state.openedProduct = Object.assign( {}, state.openedProduct, {
          liked_by: [ user ]
        } );

      } else {

        state.openedProduct = Object.assign( {}, state.openedProduct, {
          liked_by: []
        } );

      }

    }

    /*    if ( state.openedProduct !== null ) {

     if ( state.openedProduct.hasOwnProperty( 'liked_by' ) ) {

     const foundUser = state.openedProduct.liked_by.find( ( { id } ) => {

     return id === user.id;

     } );

     if ( typeof foundUser === 'undefined' ) {

     state.openedProduct = Object.assign(
     {},
     state.openedProduct,
     {
     liked_by: state.openedProduct.liked_by.concat( [ user ] )
     }
     );

     } else {

     if ( !like ) {

     const liked_by = [];

     state.openedProduct.liked_by.forEach( ( userItem ) => {

     if ( userItem.id !== user.id ) {
     liked_by.push( userItem );
     }

     } );

     state.openedProduct = Object.assign( {}, state.openedProduct, {
     liked_by
     } );

     }

     }

     } else {

     state.openedProduct = Object.assign( {}, state.openedProduct, {
     liked_by: [ user ]
     } );

     }

     }*/

    if ( state.lists.hasOwnProperty( 'profile' ) ) {

      const { products } = state.lists.profile;

      if ( like ) {

        state.lists.profile = Object.assign( {}, state.lists.profile, {
          products: [ product ].concat( products )
        } )

      } else {

        const newProducts = [];

        for ( let i = 0; i < products.length; i++ ) {

          const { id } = products[ i ];

          if ( id !== product.id ) {

            newProducts.push( products[ i ] );

          }

        }

        state.lists.profile = Object.assign( {}, state.lists.profile, {
          products: newProducts
        } )

      }

    } else {

      if ( like ) {

        state.lists = Object.assign(
          {},
          state.lists,
          {
            [ 'profile' ]: {

              products: [ Object.assign( {}, product ) ],
              needLoadMore: false,
              animateShow: true,
              hasMore: true,

              lastScrollTop: 0,
              direction: true,
              shift: true,

              isLoading: false,
              searchOptions: {},
              scrollTop: 0,
              scrollTopReal: 0,
              rowHeight: 0,
              topBlockHeight: 0,
              bottomBlockHeight: 0,
              idStart: 0,
              idEnd: ITEMS_PER_PAGE,
              landingIdStart: 0,
              landingIdEnd: ITEMS_PER_PAGE

            }
          }
        )

      }

    }

  },

  [PRODUCTS_SET_COLUMN_NUMBER] ( state, columnNumber = 3 ) {

    if ( columnNumber === 3 ) {

      const rowHeight = state.containerWidth / columnNumber;

      for ( let listId in state.lists ) {

        if ( state.lists.hasOwnProperty( listId ) ) {

          const { scrollTop, scrollTopReal, idStart } = state.lists[ state.listId ];

          const newScrollTop     = parseInt( idStart / columnNumber ) * rowHeight;
          const newScrollTopReal = newScrollTop + (scrollTopReal - scrollTop);

          state.lists[ listId ].scrollTop     = newScrollTop;
          state.lists[ listId ].scrollTopReal = newScrollTopReal;

        }

      }

    }
    state.columnCount = columnNumber;

  },

  [PRODUCTS_LOADING] ( state, loading = true ) {

    state.loading = loading;

  },

  [PRODUCTS_SET_CALL_BACK_AFTER_LOADING] ( state, callBack ){

    state.callBackAfterLoading = callBack;

  },

  [PRODUCTS_CLOSE] ( state ) {

    state.loading = true;

  },

  [PRODUCTS_RESET_SCROLL_BY_LIST_ID] ( state, listId ){

    if ( state.lists.hasOwnProperty( listId ) ) {

      state.lists[ listId ] = Object.assign( {}, state.lists[ listId ], {

        isLoading: false,
        searchOptions: {},

        scrollTop: 0,
        scrollTopReal: 0,
        rowHeight: 0,
        topBlockHeight: 0,
        bottomBlockHeight: 0,
        idStart: 0,
        idEnd: ITEMS_PER_PAGE,
        landingIdStart: 0,
        landingIdEnd: ITEMS_PER_PAGE

      } )

    }

  },

  [PRODUCTS_SET_SCROLL] ( state, options ) {

    if ( state.lists.hasOwnProperty( state.listId ) ) {

      for ( const key in options ) {

        if ( options.hasOwnProperty( key ) ) {

          if ( state.lists[ state.listId ].hasOwnProperty( key ) ) {

            state.lists[ state.listId ][ key ] = typeof options[ key ] === 'undefined' ?
              state.lists[ state.listId ][ key ] :
              options[ key ];

          }

        }

      }

    }

  },

  [PRODUCTS_SET_ANIMATE] ( state, animateShow = true, listId = state.listId ) {

    if ( state.lists.hasOwnProperty( listId ) ) {

      state.lists[ listId ].animateShow = animateShow;

    }

  },

  [PRODUCTS_SET_COME_BACK] ( state, comeBack = false ) {

    state.comeBack = comeBack;

  }

};

export default {
  state,
  mutations
};
