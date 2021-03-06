import * as types from '../mutation-types';
import * as products from 'services/products.js';
import { searchValue, selectedTagsId } from 'vuex/getters/search.js';
import { user } from 'vuex/getters/user.js';
import {
  getLastProduct,
  getColumnCount,
  getProducts,
  hasMore,
  getOpenedProduct,
  isLiked,
  isAnimateShow,
  getScrollData,
  getCountElementOnPage
} from 'vuex/getters/products.js';

export const setAnimate = ( { dispatch }, state ) => {

  dispatch( types.PRODUCTS_SET_ANIMATE, state );

};

export const setListId = ( { dispatch }, listId ) => {

  dispatch( types.PRODUCTS_SET_LIST_ID, listId );

};

export const setColumnNumber = ( { dispatch }, columnNumber ) => {

  dispatch( types.PRODUCTS_SET_COLUMN_NUMBER, columnNumber );

};

export const closeProduct = ( { dispatch } ) => {

  dispatch( types.PRODUCTS_SET_OPENED_PRODUCT, null );

};

export const closeProducts = ( { dispatch } ) => {

  dispatch( types.PRODUCTS_CLOSE );

};

export const loadProducts = (
  { dispatch, state },
  { isSearch, isTags, filterByUserName, filterByUserId, limit },
  force = false
) => {

  dispatch( types.PRODUCTS_LOADING, true );

  return new Promise( ( resolve, reject ) => {

    const items = getProducts( state );

    if ( items === null || force ) {

      setAnimate( { dispatch, state }, true );

      products
        .find( getSearchOptions( { state }, { isSearch, isTags, filterByUserName, filterByUserId, limit }, force ) )
        .then( data => {

          if ( force ) {

            dispatch( types.PRODUCTS_FORCE_RECEIVE, data.object_list );

          } else {

            dispatch( types.PRODUCTS_RECEIVE, data.object_list );

          }

          resolve();

        } )
        .catch( ( error ) => {
          products.sendError( error, { state, isSearch, isTags, filterByUserName, filterByUserId, limit } );
          reject( error );
        } );

    } else {

      if ( hasMore( state ) ) {

        setAnimate( { dispatch, state }, true );

        products
          .find( getSearchOptions( { state }, { isSearch, isTags, filterByUserName, filterByUserId, limit }, force ) )
          .then( data => {

            dispatch( types.PRODUCTS_RECEIVE, data.object_list );

            resolve();

          } )
          .catch( ( error ) => {
            products.sendError( error, { state, isSearch, isTags, filterByUserName, filterByUserId, limit } );
            reject( error );
          } );

      } else {

        resolve();

      }

    }

  } );

};

const getRows = ( state ) => {

  const columnCount = getColumnCount( state );
  const products    = getProducts( state );

  if ( products !== null ) {

    return parseInt( products.length / columnCount )

  }

  return 0;

};

const getRowsByCount = ( state, countElements ) => {

  return parseInt( countElements / getColumnCount( state ) );

};

const getCountItemsByRows = ( state, rowsCount ) => {

  return getColumnCount( state ) * rowsCount;

};

export const initScroll = ( { dispatch, state }, options ) => {

  options.searchData.limit = 27;

  if ( options.searchData.limit > 0 ) {

    return loadProducts( { dispatch, state }, options.searchData, false ).then( () => {

      dispatch( types.PRODUCTS_SET_SCROLL, Object.assign( {}, options, {
        idEnd: getCountItemsByRows( state, getRows( state ) + 27 )
      } ) );

    } )

  }

};

const getLocalScrollTop = ( state, scrollTop ) => {

  const { topBlockHeight } = getScrollData( state );

  if ( topBlockHeight >= scrollTop ) {

    return 0;

  }

  return scrollTop - topBlockHeight;

};

const getCurrentRow = ( state, scrollTop, rowHeight ) => {

  return parseInt( scrollTop / rowHeight );

};

const getShift = ( { dispatch, state }, scrollTop, rowHeight ) => {

  const { lastScrollTop, direction, shift } = getScrollData( state );

  const data = {
    direction,
    shift
  };

  data.direction = scrollTop >= lastScrollTop;

  if ( data.direction ) {

    data.shift = getCurrentRow( state, scrollTop, rowHeight );

  }

  if ( !data.direction ) {

    if ( getLocalScrollTop( state, scrollTop ) <= 0 ) {

      data.shift = getCurrentRow( state, scrollTop, rowHeight );

    }

  }

  dispatch( types.PRODUCTS_SET_SCROLL, {
    lastScrollTop: scrollTop,
    shift: data.shift,
    direction: data.direction
  } );

  return data;

};

/**
 *
 isLoading: false,

 searchOptions: {},

 scrollTop: 0,

 scrollTopReal: 0,

 rowHeight: 0,

 topBlockHeight: 0,

 bottomBlockHeight: 0,

 idStart: 0,

 idEnd: ITEMS_PER_PAGE,

 * */

export const resetScrollByListId = ( { dispatch }, listId ) => {

  dispatch( types.PRODUCTS_RESET_SCROLL_BY_LIST_ID, listId );

};

const recursivelyLoad = ( { dispatch, state }, count, data ) => {

  let _count = count;

  return new Promise( ( resolve, reject ) => {

    const loading = () => {

      loadProducts( { dispatch, state }, data, false )
        .then( () => {

          _count--;

          if ( _count > 0 ) {

            loading();

          } else {

            resolve();

          }

        }, reject );

    };

    loading();

  } );

};

export const updateScroll = (() => {

  let oldShift = null;

  return (
    { dispatch, state },
    {
      scrollTop = getScrollData( state ).scrollTop,
      rowHeight,
      scrollTopReal = getScrollData( state ).scrollTopReal,
      searchOptions = getScrollData( state ).searchOptions
    }
  ) => {

    const { shift, direction } = getShift( { dispatch, state }, scrollTop, rowHeight );

    dispatch( types.PRODUCTS_SET_SCROLL, { rowHeight, scrollTopReal, scrollTop } );

    if ( oldShift !== shift ) {

      oldShift = shift;

      const allEls    = 27;
      const elsByPage = getCountElementOnPage( state );

      const isLoading = getScrollData( state ).isLoading;

      const landingIdStart = shift * getColumnCount( state );
      const landingIdEnd   = elsByPage + shift * getColumnCount( state );

      const idStart = landingIdStart < ( allEls - elsByPage ) ? 0 : landingIdStart - ( allEls - elsByPage );
      const idEnd   = landingIdEnd < allEls ? allEls : landingIdEnd;

      const bottomBlockHeight = ( getRows( state ) - getRowsByCount( state, idEnd ) ) * rowHeight;

      if ( hasMore( state ) && direction && ( getRows( state ) - shift ) <= 18 ) {

        if ( !isLoading ) {

          const _searchOptions = Object.assign( {}, searchOptions, { limit: elsByPage } );

          dispatch( types.PRODUCTS_SET_SCROLL, { isLoading: true } );

          recursivelyLoad( { dispatch, state }, 3, _searchOptions ).then().then( () => {

            updateScroll( { dispatch, state }, { scrollTop, rowHeight, scrollTopReal, searchOptions: _searchOptions } );

            dispatch( types.PRODUCTS_SET_SCROLL, { isLoading: false } );

          } );

        }

      }
      dispatch( types.PRODUCTS_SET_SCROLL, {
        rowHeight,
        scrollTopReal,
        scrollTop,
        topBlockHeight: getRowsByCount( state, idStart ) * rowHeight,
        bottomBlockHeight: bottomBlockHeight > 0 ? bottomBlockHeight : 0,
        landingIdStart,
        landingIdEnd,
        idStart,
        idEnd
      } );

      const { idStart: _idStart, idEnd:_idEnd } = getScrollData( state );

      console.log( { _idStart, _idEnd } );

    }

  };

})()

export const run = ( { dispatch, state }, options, force ) => {

  /**
   * Смысл в том что если в ленте нет элементов занчит это инициализация,
   * я загружаю ленту и возвращаю позицию скрола.
   *
   * Если элементы есть я просто возвращаю позицию скролла из состояния.
   * */

  if ( !force ) {

    const items = getProducts( state );

    // Stats
    mixpanel.track( 'Show More Products', {
      offset: items !== null ? items.length : null,
      view: `${ getColumnCount( state ) }columns`
    } );

  }

  const items = getProducts( state );

  if ( items === null || force ) {

    /**
     * Изначальная загрузка или загрузка с перезаписью.
     * **/

    return new Promise( ( resolve, reject ) => {

      let count  = 2;
      let _force = force;

      const loading = () => {

        options.limit = getCountElementOnPage( state );

        loadProducts( { dispatch, state }, options, _force )
          .then( () => {

            if ( isAnimateShow( state ) ) {

              setTimeout( () => {

                setAnimate( { dispatch, state }, false );

              }, 2000 );

            }

            _force = false;

            count--;

            if ( count > 0 ) {

              loading();

            } else {

              dispatch( types.PRODUCTS_SET_SCROLL,
                Object.assign(
                  {},
                  options, {
                    idEnd: getCountItemsByRows( state, 27 ) // 27 - это кол-во строк.
                  }
                )
              );

              resolve( 0 ); // 0 - это scrollTop.

            }

          }, reject );

      };

      loading();

    } );

  } else {

    /**
     * Восстановление скролла.
     * 1) Нужно быстро показать чтонибудь
     * 2) Нужно добавить много элементов чтобы не мерцать скролл.
     * */



    console.log( getScrollData( state ) );

    return Promise.resolve( getScrollData( state ).scrollTopReal );

  }

};

export const setCallBackAfterLoading = (
  { dispatch }, callback = () => {
  }
) => {

  dispatch( types.PRODUCTS_SET_CALL_BACK_AFTER_LOADING, callback )

};

export const setScrollByProduct = ( { dispatch, state }, scrollTop ) => {

  dispatch( types.PRODUCTS_SAVE_SCROLL_BY_PRODUCT, scrollTop, getOpenedProduct( state ).id );

};

export const setComeBack = ( { dispatch }, comeBack = false ) => {

  dispatch( types.PRODUCTS_SET_COME_BACK, comeBack )

};

export const setLike = (
  { dispatch, state },
  product = getOpenedProduct( state ),
  newLikeState = !isLiked( state )
) => {

  if ( product !== null ) {

    dispatch( types.PRODUCTS_UPDATE_LIKED_BY, product, user( state ), newLikeState );

    products
      .like( product.id, newLikeState )
      .then( ( isLike ) => {
        if ( !isLike ) {

          dispatch( types.PRODUCTS_UPDATE_LIKED_BY, product, user( state ), false );

          console.warn( `Отрицательный ответ на установку
          like в ${ newLikeState }
          от пользователя ${ user( state ).id }.
          Id продкута ${ product.id }` );

        }
      } );

  }

  return null;

};

export const getSearchOptions = (
  { state },
  { isSearch, isTags, filterByUserName, filterByUserId, limit = state.products.ITEMS_PER_PAGE },
  force = false
) => {

  const request = {
    q: null,
    from_id: null,
    tags: null,
    limit,
    offset: null,
    instagram_name: null,
    user_id: null
  };

  if ( !force ) {

    const lastProduct = getLastProduct( state );

    if ( lastProduct !== null ) {

      request.from_id = lastProduct.id

    }

  }

  if ( isSearch ) {

    const q = searchValue( state );

    if ( typeof q === 'string' ) {

      request.q = q.trim();

    }

  }

  if ( isTags ) {

    const tags = selectedTagsId( state );

    if ( Array.isArray( tags ) ) {

      request.tags = tags;

    }

  }

  if ( filterByUserName ) {

    request.instagram_name = filterByUserName;

  }

  if ( filterByUserId ) {

    request.user_id = filterByUserId;

  }

  return request;

};

export const openProduct = ( { dispatch, state }, id ) => {

  /**
   * Логика упростилась так как каждый раз при открытии продкута нужно его запрашивать
   * не известно был ли установлени или снят @savetrend/
   * TODO попросить сделать событие product.LIKE - позволит постоянно не запрашивать объект продукта.
   * */

  return products
    .get( id )
    .then( ( product ) => {
      dispatch( types.PRODUCTS_SET_OPENED_PRODUCT, product );
    } )
    .catch( ( error ) => {
      products.sendError( error, { state, id } );
    } );

  /*  const product = getProduct( state, id );

   return new Promise( ( resolve, reject ) => {

   if ( product !== null ) {

   if ( product.hasOwnProperty( 'liked_by' ) ) {

   dispatch( types.PRODUCTS_SET_OPENED_PRODUCT, product );
   resolve();

   } else {

   /!**
   * !!! Внимание
   * Этот дублирущий запрос делается потому что сейчас в объектах ленты нет поля liked_by.
   * *!/

   products
   .get( id )
   .then( ( product ) => {
   dispatch( types.PRODUCTS_SET_OPENED_PRODUCT, product );
   resolve();
   } )
   .catch( ( error ) => {
   products.sendError( error, { state, id } );
   reject( error );
   } );

   }

   } else {

   products
   .get( id )
   .then( ( product ) => {
   dispatch( types.PRODUCTS_SET_OPENED_PRODUCT, product );
   resolve();
   } )
   .catch( ( error ) => {
   products.sendError( error, { state, id } );
   reject( error );
   } );

   }

   } );*/

};

export const setContainerWidth = ( { dispatch, state }, width ) => {

  dispatch( types.PRODUCTS_SET_CONTAINER_WIDTH, width );

};
