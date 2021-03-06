<style src='./styles/photos.pcss'></style>
<template lang="jade">
.photos(v-bind:style="styleObject", v-el:container)
  .photos__list(v-el:photos-list, v-if='items')

    .top-block-height(v-bind:style="{ height: topHeight }", v-show="this.getScrollData.topBlockHeight > 0")

    template(v-for='item in items | list' track-by="id")
      photo-item( :product.once='item', :animate='isAnimateShow' )

    .bottom-block-height(v-bind:style="{ height: bottomHeight }", v-show="this.getScrollData.bottomBlockHeight > 0")

  .photos__more-wrap(v-if='hasMore')
    .photos__more( :class='{"_active": isLoading}' )
        .photos__more__base-ic: span еще
        .photos__more__anim-ic: i.ic-update

  .photos__no-more-wrap(v-if='itemsLength === 0 && !hasMore')
    .photos__no-goods Товаров не найдено
    .main__bottom.__no-goods: a.link.link_primary(
      @click.prevent.stop='clearSearch()',
      href='#',
      v-if="tags || search" ) Сбросить поиск

scroll-top
</template>

<script type='text/babel'>
  import listen from 'event-listener';

  import scrollTop from 'base/scroll-top/scroll-top.vue';
  import photoItem from './photo-item.vue';

  import { clearSearch } from 'vuex/actions/search.js';
  import { searchValue, tags, selectedTagsId } from 'vuex/getters/search.js';

  import { run, setListId, initScroll, updateScroll, closeProducts, setContainerWidth } from 'vuex/actions/products';

  import {
    getProducts,
    hasMore,
    isLoading,
    isAnimateShow,
    getColumnCount,
    getScrollData,
  } from 'vuex/getters/products';

  export default {

    vuex: {

      getters: {
        items: getProducts,
        hasMore,
        isLoading,
        isAnimateShow,
        searchValue,
        selectedTags: tags,
        selectedTagsId,
        getColumnCount,
        getScrollData
      },

      actions: {
        run,
        setListId,
        initScroll,
        updateScroll,
        clearSearch,
        closeProducts,
        setContainerWidth
      }

    },

    props: {
      tags: {
        type: Boolean,
        default: false
      },
      search: {
        type: Boolean,
        default: false
      },
      filterByUserName: {
        default: null
      },
      filterByUserId: {
        default: null
      },
      listId: {
        type: String,
        required: true
      },
      infinityScroll: {
        type: Boolean,
        default: true
      }
    },

    data() {
      return {
        styleObject: {
          pointerEvents: 'auto'
        },
        lastSelectedTagId: null,
        isRunning: false
      }
    },

    ready() {

      this.setContainerWidth( this.$els.container.offsetWidth );

      this.scrollCnt = document.querySelector( '.scroll-cnt' );

      this.$set( 'lastSelectedTagId', this.selectedTagsId.join( ',' ) );

      this.setListId( this.listId );

      this.resize = listen( window, 'optimizedResize', () => {

        this.setContainerWidth( this.$els.container.offsetWidth );

        this._updateRowHeight();

      } );

      this._run().then( ( scrollTop ) => {

        this.runScroll();
        this.emitIsRun();

        this.$set( 'isRunning', true );

        this.scrollCnt.scrollTop = scrollTop;

      } );

    },

    beforeDestroy() {

      this.resize.remove();

      if ( this.scrollEvent ) {

        this.scrollEvent.remove();

      }

      this.closeProducts();

      this.$set('isRunning', false);

    },

    filters: {
      list( value ){

        const { idStart, idEnd } = this.getScrollData;

        return value.slice( idStart, idEnd );
      }
    },

    methods: {

      _setScroll() {

        if ( this.rowHeight > 0 && this.isRunning ) {

          const { search, tags, filterByUserName, filterByUserId } = this;

          this.updateScroll( {
            scrollTop: this.scrollTop,
            rowHeight: this.rowHeight,
            scrollTopReal: this.scrollCnt.scrollTop,
            searchOptions: { isSearch: search, isTags: tags, filterByUserName, filterByUserId }
          } );

        }

      },

      _updateRowHeight() {

        if( this.isRunning ){

          this.updateScroll( {
            rowHeight: this.rowHeight
          } );

        }

      },

      _run( force = false ) {

        const { search, tags, filterByUserName, filterByUserId } = this;

        return this.run( { isSearch: search, isTags: tags, filterByUserName, filterByUserId }, force );

      },

      emitIsRun() {

        this.$dispatch( 'photosIsRun' );

      },

      runScroll() {

        if ( this.scrollEvent ) {

          this.scrollEvent.remove();

        }

        this.scrollEvent = listen( this.scrollCnt, 'scroll', (() => {

          let timerId = null;

          return () => {

            if ( timerId !== null ) {

              clearTimeout( timerId );

            }

            this.$set( 'styleObject.pointerEvents', 'none' );

            timerId = setTimeout( () => {

              this.$set( 'styleObject.pointerEvents', 'auto' );

            }, 200 );

            this._setScroll();

          }

        })() );

      }

    },

    computed: {

      topHeight: {
        cache: false,
        get(){
          return `${ this.getScrollData.topBlockHeight }px`
        }
      },

      bottomHeight: {
        cache: false,
        get(){
          return `${ this.getScrollData.bottomBlockHeight }px`
        }
      },

      scrollTop: {
        cache: false,
        get(){

          const scrollTop = this.$els.container.getBoundingClientRect().top;

          return ( scrollTop > 0 ) ? 0 : Math.abs( scrollTop );

        }
      },

      rowHeight: {
        cache: false,
        get(){

          if ( this.$els ) {
            if ( this.$els.photosList ) {
              if ( this.$els.photosList.children ) {
                if ( this.$els.photosList.children[ 1 ] ) {
                  return this.$els.photosList.children[ 1 ].offsetHeight
                }
              }
            }
          }

          return 300;

        }
      },

      itemsLength() {

        if ( Array.isArray( this.items ) ) {

          return this.items.length;

        }

        return 0;

      }

    },

    watch: {
      getColumnCount(){
        this.scrollCnt.scrollTop = this.getScrollData.scrollTopReal;
        this._updateRowHeight();
      },
      items(){
        this._setScroll();
      },
      listId( listId ) {

        this.setListId( listId );

        this._run().then( ( scrollTop ) => {

          this.scrollCnt.scrollTop = scrollTop;

        } );

      },
      selectedTagsId( selectedTagsId ) {

        if ( this.tags ) {

          const tagsString = selectedTagsId.join( ',' );

          if ( this.lastSelectedTagId !== tagsString ) {

            this.$set( 'lastSelectedTagId', tagsString );

            this._run( true );

          }

        }

      },
      searchValue() {

        if ( this.search ) {

          this._run( true );

        }

      }
    },

    components: {
      photoItem,
      scrollTop
    }
  }
</script>
