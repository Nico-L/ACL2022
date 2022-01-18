<!-- v1.1.0 -->

<script context="module">
    export function bind(Component, props = {}) {
      return function ModalComponent(options) {
        return new Component({
          ...options,
          props: {
            ...props,
            ...options.props,
          },
        });
      };
    }
  </script>
  
  <script>
    import * as svelte from 'svelte';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    const baseSetContext = svelte.setContext;
  
    export let show = null;
  
    export let key = 'simple-modal';
    export let closeButton = true;
    export let closeOnEsc = true;
    export let closeOnOuterClick = true;
    export let styleBg = {};
    export let styleWindowWrap = {};
    export let styleWindow = {};
    export let styleContent = {};
    export let styleCloseButton = {};
    export let setContext = baseSetContext;
    export let transitionBg = fade;
    export let transitionBgProps = { duration: 250 };
    export let transitionWindow = transitionBg;
    export let transitionWindowProps = transitionBgProps;
    export let disableFocusTrap = false;
  
    const defaultState = {
      closeButton,
      closeOnEsc,
      closeOnOuterClick,
      styleBg,
      styleWindowWrap,
      styleWindow,
      styleContent,
      styleCloseButton,
      transitionBg,
      transitionBgProps,
      transitionWindow,
      transitionWindowProps,
      disableFocusTrap,
    };
    let state = { ...defaultState };
  
    let Component = null;
  
    let background;
    let wrap;
    let modalWindow;
    let scrollY;
    let cssBg;
    let cssWindowWrap;
    let cssWindow;
    let cssContent;
    let cssCloseButton;
    let currentTransitionBg;
    let currentTransitionWindow;
    let prevBodyPosition;
    let prevBodyOverflow;
    let prevBodyWidth;
    let outerClickTarget;
  
    const camelCaseToDash = (str) =>
      str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  
    const toCssString = (props) =>
      props
        ? Object.keys(props).reduce(
            (str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`,
            ''
          )
        : '';
  
    const isFunction = (f) => !!(f && f.constructor && f.call && f.apply);
  
    const updateStyleTransition = () => {
      cssBg = toCssString(
        Object.assign(
          {},
          {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          state.styleBg
        )
      );
      cssWindowWrap = toCssString(state.styleWindowWrap);
      cssWindow = toCssString(state.styleWindow);
      cssContent = toCssString(state.styleContent);
      cssCloseButton = toCssString(state.styleCloseButton);
      currentTransitionBg = state.transitionBg;
      currentTransitionWindow = state.transitionWindow;
    };
  
    const toVoid = () => {};
    let onOpen = toVoid;
    let onClose = toVoid;
    let onOpened = toVoid;
    let onClosed = toVoid;
  
    const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
      Component = bind(NewComponent, newProps);
      state = { ...defaultState, ...options };
      updateStyleTransition();
      disableScroll();
      onOpen = (event) => {
        if (callback.onOpen) callback.onOpen(event);
        dispatch('open');
        dispatch('opening'); // Deprecated. Do not use!
      };
      onClose = (event) => {
        if (callback.onClose) callback.onClose(event);
        dispatch('close');
        dispatch('closing'); // Deprecated. Do not use!
      };
      onOpened = (event) => {
        if (callback.onOpened) callback.onOpened(event);
        dispatch('opened');
      };
      onClosed = (event) => {
        if (callback.onClosed) callback.onClosed(event);
        dispatch('closed');
      };
    };
  
    const close = (callback = {}) => {
      if (!Component) return;
      onClose = callback.onClose || onClose;
      onClosed = callback.onClosed || onClosed;
      Component = null;
      enableScroll();
    };
  
    const handleKeydown = (event) => {
      if (state.closeOnEsc && Component && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
  
      if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
        // trap focus
        const nodes = modalWindow.querySelectorAll('*');
        const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);
  
        let index = tabbable.indexOf(document.activeElement);
        if (index === -1 && event.shiftKey) index = 0;
  
        index += tabbable.length + (event.shiftKey ? -1 : 1);
        index %= tabbable.length;
  
        tabbable[index].focus();
        event.preventDefault();
      }
    };
  
    const handleOuterMousedown = (event) => {
      if (
        state.closeOnOuterClick &&
        (event.target === background || event.target === wrap)
      )
        outerClickTarget = event.target;
    };
  
    const handleOuterMouseup = (event) => {
      if (state.closeOnOuterClick && event.target === outerClickTarget) {
        event.preventDefault();
        close();
      }
    };
  
    const disableScroll = () => {
      scrollY = window.scrollY;
      prevBodyPosition = document.body.style.position;
      prevBodyOverflow = document.body.style.overflow;
      prevBodyWidth = document.body.style.width;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
    };
  
    const enableScroll = () => {
      document.body.style.position = prevBodyPosition || '';
      document.body.style.top = '';
      document.body.style.overflow = prevBodyOverflow || '';
      document.body.style.width = prevBodyWidth || '';
      window.scrollTo(0, scrollY);
    };
  
    setContext(key, { open, close });
  
    let isMounted = false;
  
    $: {
      if (isMounted) {
        if (isFunction(show)) {
          open(show);
        } else {
          close();
        }
      }
    }
  
    svelte.onDestroy(() => {
      if (isMounted) close();
    });
  
    svelte.onMount(() => {
      isMounted = true;
    });
  </script>
  
  
  <svelte:window on:keydown="{handleKeydown}" />
  
  {#if Component}
  <div
    class="bg {styleBg}"
    on:mousedown="{handleOuterMousedown}"
    on:mouseup="{handleOuterMouseup}"
    bind:this="{background}"
    transition:currentTransitionBg="{state.transitionBgProps}"
    style="{cssBg}"
  >
    <div class="window-wrap" bind:this="{wrap}" style="{cssWindowWrap}">
      <div
        class="window {styleWindow}"
        role="dialog"
        aria-modal="true"
        bind:this="{modalWindow}"
        transition:currentTransitionWindow="{state.transitionWindowProps}"
        on:introstart="{onOpen}"
        on:outrostart="{onClose}"
        on:introend="{onOpened}"
        on:outroend="{onClosed}"
        style="{cssWindow}"
      >
        {#if state.closeButton} {#if isFunction(state.closeButton)}
        <svelte:component this="{state.closeButton}" onClose="{close}" />
        {:else}
        <button on:click="{close}" class="close {styleCloseButton}" style="{cssCloseButton}" />
        {/if} {/if}
        <div class="content {styleContent}" style="{cssContent}">
          <svelte:component this="{Component}" />
        </div>
      </div>
    </div>
  </div>
  {/if}
  <slot></slot>
  
  