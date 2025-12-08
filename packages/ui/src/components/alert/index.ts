/**
 * Alert component for Natural-JS.
 */

import { NaturalElement, isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { isString, isArray, isPlainObject, isFunction, message as messageUtils, event as eventUtils, getConfig } from '@natural-js/core';
import { getMaxZIndex, showWithTransition, hideWithTransition } from '../../utils';
import { makeDraggable } from '../../utils/draggable';
import { AlertOptions, AlertUserOptions, AlertConstructorParam } from './types';

export * from './types';

/**
 * Get merged default options from config.
 */
function getDefaultOptions(): Partial<AlertOptions> {
  const config = getConfig();
  const alertConfig = config.ui?.alert;

  return {
    html: false,
    width: 0,
    height: 0,
    button: true,
    closeMode: 'remove',
    modal: true,
    overlayColor: null,
    overlayClose: true,
    escClose: true,
    confirm: false,
    alwaysOnTop: alertConfig?.alwaysOnTop ?? true,
    alwaysOnTopCalcTarget: 'div, span, ul, p, nav, article, section, header, footer, aside',
    dynPos: true,
    windowScrollLock: true,
    draggable: alertConfig?.draggable ?? true,
    draggableOverflowCorrection: true,
    draggableOverflowCorrectionAddValues: {
      top: alertConfig?.draggableOverflowCorrectionAddValues?.top ?? 0,
      bottom: alertConfig?.draggableOverflowCorrectionAddValues?.bottom ?? 0,
      left: alertConfig?.draggableOverflowCorrectionAddValues?.left ?? 0,
      right: alertConfig?.draggableOverflowCorrectionAddValues?.right ?? 0,
    },
    saveMemory: alertConfig?.saveMemory ?? false,
    input: {
      displayTimeout: alertConfig?.input?.displayTimeout ?? 7000,
      closeBtn: alertConfig?.input?.closeBtn ?? '&times;',
    },
  };
}

/**
 * Get button styling from config.
 */
function getButtonConfig() {
  const config = getConfig();
  const alertConfig = config.ui?.alert;
  const locale = config.core?.locale || 'ko_KR';
  
  const okBtnOpts = alertConfig?.okButtonOpts;
  const cancelBtnOpts = alertConfig?.cancelButtonOpts;
  const okBtnClass = okBtnOpts ? `btn_common__ btn_${okBtnOpts.size || 'medium'}__ btn_${okBtnOpts.color || 'primary'}__` : 'btn_common__ btn_medium__ btn_primary__';
  const cancelBtnClass = cancelBtnOpts ? `btn_common__ btn_${cancelBtnOpts.size || 'medium'}__ btn_${cancelBtnOpts.color || 'secondary'}__` : 'btn_common__ btn_medium__ btn_secondary__';
  
  const messages = alertConfig?.message?.[locale] || alertConfig?.message?.['ko_KR'] || { confirm: '확인', cancel: '취소' };

  return {
    okBtnClass,
    cancelBtnClass,
    confirmText: messages.confirm || '확인',
    cancelText: messages.cancel || '취소',
    closeText: '닫기',
  };
}

export class Alert {
  public options: AlertOptions;
  private dragCleanup: (() => void) | null = null;
  private scrollLockCleanup: (() => void) | null = null;

  constructor(
    target: NaturalElement | Element | Window,
    msgOrOptions?: AlertConstructorParam,
    vars?: string[]
  ) {
    if (!isBrowser()) {
      this.options = {} as AlertOptions;
      return;
    }

    const doc = getDocument();
    const win = getWindow();
    if (!doc || !win) {
      this.options = {} as AlertOptions;
      return;
    }

    let contextEl: NaturalElement;
    let isWindowTarget = false;

    if (target === win || (target as Window).document !== undefined) {
      contextEl = new NaturalElement(doc.body);
      isWindowTarget = true;
    } else if (target instanceof NaturalElement) {
      contextEl = target;
      isWindowTarget = contextEl.is('body');
    } else {
      contextEl = new NaturalElement(target as Element);
      isWindowTarget = contextEl.is('body');
    }

    const defaultOpts = getDefaultOptions();
    
    this.options = {
      ...defaultOpts,
      context: contextEl,
      container: null,
      msgContext: new NaturalElement([]),
      msgContents: null,
      msg: '',
      vars,
      isInput: false,
      isWindow: isWindowTarget,
      title: isWindowTarget ? undefined : contextEl.attr('title') || undefined,
      onOk: null,
      onCancel: null,
      onBeforeShow: null,
      onShow: null,
      onBeforeHide: null,
      onHide: null,
      onBeforeRemove: null,
      onRemove: null,
    } as AlertOptions;

    if (isString(msgOrOptions)) {
      this.options.msg = msgOrOptions;
    } else if (isArray(msgOrOptions)) {
      this.options.msg = msgOrOptions;
    } else if (isPlainObject(msgOrOptions)) {
      const userOpts = msgOrOptions as AlertUserOptions;
      Object.assign(this.options, userOpts);
      if (userOpts.title !== undefined) this.options.title = userOpts.title;
    }

    if (!this.options.container) {
      this.options.container = new NaturalElement(doc.body);
    } else if (isString(this.options.container)) {
      this.options.container = new NaturalElement(doc.querySelector(this.options.container as unknown as string) || doc.body);
    }

    if (contextEl.is(':input')) {
      this.options.isInput = true;
    }

    if (this.options.isWindow) {
      this.options.context = new NaturalElement(doc.body);
    }

    if (!this.options.isInput) {
      this.wrapElement();
      this.options.msgContents?.data('alert', this);
    } else {
      this.wrapInputElement();
      this.options.context.data('alert', this);
    }

    if (this.options.saveMemory) {
      this.options.msg = '';
      this.options.vars = undefined;
    }
  }

  private wrapElement(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    let maxZIndex = opts.alwaysOnTop ? getMaxZIndex(opts.alwaysOnTopCalcTarget) : 0;

    let overlay: HTMLDivElement | null = null;
    if (opts.modal !== false) {
      overlay = doc.createElement('div');
      overlay.className = 'alert_overlay__ block_overlay__';
    overlay.style.display = 'none';
    overlay.style.position = opts.isWindow ? 'fixed' : 'absolute';
    overlay.style.cursor = 'not-allowed';
    overlay.style.padding = '0';
    if (!opts.isWindow) overlay.style.borderRadius = opts.context.css('border-radius') || '0px';
    if (opts.alwaysOnTop) overlay.style.zIndex = String(maxZIndex + 1);
    if (opts.overlayColor) overlay.style.backgroundColor = opts.overlayColor;

    const containerEl = opts.isWindow ? opts.container : opts.context;
    if (containerEl) {
      if (opts.isWindow) {
        containerEl.append(overlay);
      } else {
        const contextEl = opts.context.get(0);
        contextEl?.parentNode?.insertBefore(overlay, contextEl.nextSibling);
      }
    }
    opts.msgContext = new NaturalElement(overlay);
    } else {
      opts.msgContext = new NaturalElement([]);
    }

    let msgText = opts.msg;
    if (opts.vars && isString(msgText)) {
      msgText = messageUtils.replaceMsgVars(msgText, opts.vars);
    }

    const msgContent = doc.createElement('div');
    msgContent.className = 'alert__ block_overlay_msg__ hidden__';
    msgContent.style.display = 'none';
    msgContent.style.position = opts.isWindow ? 'fixed' : 'absolute';
    if (opts.alwaysOnTop) msgContent.style.zIndex = String(maxZIndex + 2);

    // Get text and class from config
    const btnConfig = getButtonConfig();
    const confirmText = opts.message?.['ko_KR']?.confirm || btnConfig.confirmText;
    const cancelText = opts.message?.['ko_KR']?.cancel || btnConfig.cancelText;
    const closeText = opts.message?.['ko_KR']?.close || btnConfig.closeText;

    let titleHtml = '';
    if (opts.title !== undefined) {
      titleHtml = `<div class="msg_title_box__"><span class="msg_title__">${opts.title}</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="${closeText}"></span></a></div>`;
    }

    let buttonHtml = '';
    if (opts.button) {
      buttonHtml = `<div class="buttonBox__"><button class="confirm__ ${btnConfig.okBtnClass}">${confirmText}</button>${opts.confirm ? `<button class="cancel__ ${btnConfig.cancelBtnClass}">${cancelText}</button>` : ''}</div>`;
    }

    msgContent.innerHTML = `${titleHtml}<div class="msg_box__"></div>${buttonHtml}`;
    if (overlay && overlay.parentNode) {
      overlay.parentNode.insertBefore(msgContent, overlay.nextSibling);
    } else {
      const containerEl = opts.isWindow ? opts.container : opts.context;
      containerEl?.append(msgContent);
    }
    opts.msgContents = new NaturalElement(msgContent);

    const msgBox = opts.msgContents.find('.msg_box__');
    if (opts.html) {
      msgBox.html(isString(msgText) ? msgText : (msgText as string[]).join('<br>'));
    } else {
      msgBox.text(isString(msgText) ? msgText : (msgText as string[]).join('\n'));
    }

    if (opts.width) {
      const width = isFunction(opts.width)
        ? (opts.width as (a: NaturalElement, b: NaturalElement) => number)(opts.msgContext, opts.msgContents)
        : opts.width;
      msgBox.css('width', `${width}px`);
    }

    if (opts.height) {
      const height = isFunction(opts.height)
        ? (opts.height as (a: NaturalElement, b: NaturalElement) => number)(opts.msgContext, opts.msgContents)
        : opts.height;
      msgBox.css('height', `${height}px`);
      msgBox.css('overflow-y', 'auto');
    }

    if (opts.modal && opts.windowScrollLock) {
      const msgContextEl = opts.msgContext.get(0) as HTMLElement | undefined;
      if (msgContextEl) {
        this.scrollLockCleanup = eventUtils.windowScrollLock(msgContextEl);
      }
    }

    this.bindDialogEvents();
  }

  private bindDialogEvents(): void {
    const opts = this.options;
    const self = this;

    opts.msgContents?.find('.msg_title_close_btn__').on('click', (e: Event) => {
      e.preventDefault();
      if (opts.onCancel) {
        if (opts.onCancel(opts.msgContext, opts.msgContents) !== 0) self[opts.closeMode]();
      } else {
        self[opts.closeMode]();
      }
    });

    opts.msgContents?.find('.buttonBox__ .confirm__').on('click', (e: Event) => {
      e.preventDefault();
      if (opts.onOk) {
        if (opts.onOk(opts.msgContext, opts.msgContents) !== 0) self[opts.closeMode]();
      } else {
        self[opts.closeMode]();
      }
    });

    opts.msgContents?.find('.buttonBox__ .cancel__').on('click', (e: Event) => {
      e.preventDefault();
      if (opts.onCancel) {
        if (opts.onCancel(opts.msgContext, opts.msgContents) !== 0) self[opts.closeMode]();
      } else {
        self[opts.closeMode]();
      }
    });

    if (!opts.modal) {
      opts.msgContext.remove();
    } else if (opts.overlayClose) {
      opts.msgContext.on('click', () => {
        if (opts.onCancel) {
          if (opts.onCancel(opts.msgContext, opts.msgContents) !== 0) self[opts.closeMode]();
        } else {
          self[opts.closeMode]();
        }
      });
    }

    if (opts.draggable && opts.msgContents) {
      opts.msgContents.addClass('draggable__');
      const titleBox = opts.msgContents.find('.msg_title_box__');
      if (titleBox.length > 0) {
        this.dragCleanup = makeDraggable(opts.msgContents, {
          handle: '.msg_title_box__',
          overflowCorrection: opts.draggableOverflowCorrection,
          overflowCorrectionAddValues: opts.draggableOverflowCorrectionAddValues,
        });
      }
    }
  }

  private wrapInputElement(): void {
    const opts = this.options;
    const doc = getDocument();
    const win = getWindow();
    if (!doc || !win) return;

    const existingAlert = opts.context.data('alert') as Alert | undefined;
    if (existingAlert) existingAlert.remove();

    if (!opts.msg || (isArray(opts.msg) && opts.msg.length === 0) || (isString(opts.msg) && opts.msg.length === 0)) return;

    opts.msgContext = opts.context;

    const contextOffset = opts.context.offset();
    const contextWidth = opts.context.outerWidth() ?? 0;
    const limitWidth = (contextOffset?.left ?? 0) + contextWidth + 150;
    const isBeforeShow = limitWidth > win.innerWidth;

    const tooltipClass = isBeforeShow ? 'alert_before_show__ orgin_right__' : 'alert_after_show__ orgin_left__';
    const tooltip = doc.createElement('span');
    tooltip.className = `msg__ alert__ alert_tooltip__ hidden__ ${tooltipClass}`;
    tooltip.style.display = 'none';
    tooltip.innerHTML = '<ul class="msg_line_box__"></ul>';

    const closeText = opts.message?.['ko_KR']?.close ?? '닫기';
    tooltip.innerHTML += `<a href="#" class="msg_close__" title="${closeText}"></a>`;

    const contextEl = opts.context.get(0);
    if (contextEl?.parentNode) {
      if (isBeforeShow) {
        contextEl.parentNode.insertBefore(tooltip, contextEl);
      } else {
        contextEl.parentNode.insertBefore(tooltip, contextEl.nextSibling);
      }
    }

    opts.msgContents = new NaturalElement(tooltip);

    if (opts.alwaysOnTop && opts.container) {
      const maxZ = getMaxZIndex(opts.container.find(opts.alwaysOnTopCalcTarget));
      opts.msgContents.css('z-index', String(maxZ + 1));
    }

    const self = this;
    opts.msgContents.find('.msg_close__').on('click', (e: Event) => {
      e.preventDefault();
      self.remove();
    });

    const ul = opts.msgContents.find('.msg_line_box__');
    ul.empty();

    const messages = isArray(opts.msg) ? opts.msg : [opts.msg as string];
    messages.forEach((msg) => {
      let finalMsg = msg;
      if (opts.vars) finalMsg = messageUtils.replaceMsgVars(msg, opts.vars);
      const li = doc.createElement('li');
      li.innerHTML = finalMsg;
      ul.get(0)?.appendChild(li);
    });

    if (isBeforeShow) {
      opts.msgContents.css('margin-left', `-${opts.msgContents.outerWidth() ?? 0}px`);
    }
  }

  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  show(): this {
    const opts = this.options;
    const self = this;
    const doc = getDocument();
    const win = getWindow();

    if (!isBrowser() || !doc || !win) return this;

    if (opts.onBeforeShow) opts.onBeforeShow(opts.msgContext, opts.msgContents);

    if (!opts.isInput) {
      this.resetPosition();

      if (opts.dynPos && !opts.isWindow) {
        opts.time = setInterval(() => {
          if (opts.context.is(':visible')) this.resetPosition();
        }, 500);
      } else {
        opts.resizeHandler = () => this.resetPosition();
        win.addEventListener('resize', opts.resizeHandler);
        this.resetPosition();
      }

      if (opts.button) {
        const confirmBtn = opts.msgContents?.find('.buttonBox__ .confirm__').get(0) as HTMLButtonElement | undefined;
        confirmBtn?.focus();
      }

      if (opts.msgContents) showWithTransition(opts.msgContents);

      if (opts.onShow) setTimeout(() => opts.onShow?.(opts.msgContext, opts.msgContents), 300);
    } else {
      if (opts.msg) {
        opts.msgContext.parent().css('white-space', 'normal');
        if (opts.msgContents) {
          opts.msgContents.css('display', 'block');
          showWithTransition(opts.msgContents);
        }
        opts.iTime = setTimeout(() => {
          opts.msgContext.parent().css('white-space', '');
          self[opts.closeMode]();
        }, opts.input?.displayTimeout ?? 7000);
      }
    }

    if (opts.escClose) {
      opts.keyupHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
          if (opts.onCancel) {
            if (opts.onCancel(opts.msgContext, opts.msgContents) !== 0) self[opts.closeMode]();
          } else {
            self[opts.closeMode]();
          }
        }
      };
      doc.addEventListener('keyup', opts.keyupHandler);
    }

    return this;
  }

  private resetPosition(): void {
    const opts = this.options;
    const win = getWindow();
    if (!win || !opts.msgContents) return;

    if (!opts.context.is(':visible')) {
      opts.msgContext.hide();
      opts.msgContents.hide();
      return;
    }

    const viewportHeight = win.innerHeight;
    const viewportWidth = win.innerWidth;
    const contentHeight = opts.msgContents.outerHeight() ?? 0;
    const contentWidth = opts.msgContents.outerWidth() ?? 0;

    const overlayHeight = opts.isWindow ? viewportHeight : (opts.context.outerHeight() ?? 0);
    const overlayWidth = opts.isWindow ? viewportWidth : (opts.context.outerWidth() ?? 0);

    opts.msgContext.css('height', `${overlayHeight}px`);
    opts.msgContext.css('width', `${overlayWidth}px`);

    if (opts.isWindow) {
      opts.msgContext.css('top', '0');
      opts.msgContext.css('left', '0');
    } else {
      const marginBottom = parseFloat(opts.context.css('margin-bottom') || '0');
      opts.msgContext.css('margin-top', `-${overlayHeight + marginBottom}px`);
      const contextPos = opts.context.position();
      const marginLeft = parseFloat(opts.context.css('margin-left') || '0');
      opts.msgContext.css('left', `${(contextPos?.left ?? 0) + marginLeft}px`);
    }

    opts.msgContext.show();

    if (opts.msgContents.data('isMoved') !== true) {
      if (opts.isWindow) {
        if (opts.top !== undefined) {
          opts.msgContents.css('position', 'absolute');
          opts.msgContents.css('top', `${opts.top}px`);
        } else {
          opts.msgContents.css('top', '0');
          opts.msgContents.css('margin-top', `${Math.floor((opts.msgContext.height() ?? 0) / 2 - contentHeight / 2) - 1}px`);
        }
      } else {
        if (opts.top !== undefined) {
          opts.msgContents.css('position', 'absolute');
          opts.msgContents.css('top', `${opts.top}px`);
        } else {
          const marginBottom = parseFloat(opts.context.css('margin-bottom') || '0');
          opts.msgContents.css('margin-top', `-${Math.floor((opts.msgContext.height() ?? 0) / 2 + contentHeight / 2 + marginBottom) + 1}px`);
        }
      }

      if (opts.left !== undefined) {
        opts.msgContents.css('left', `${opts.left}px`);
      } else {
        const contextMarginLeft = parseFloat(opts.context.css('margin-left') || '0');
        const contextPosLeft = opts.context.position()?.left ?? 0;
        opts.msgContents.css('left', `${Math.floor(contextPosLeft + contextMarginLeft + ((opts.msgContext.width() ?? 0) / 2 - contentWidth / 2)) - 1}px`);
      }

      if (contentHeight > viewportHeight) {
        opts.msgContents.css('margin-top', `${win.scrollY || 0}px`);
        opts.msgContents.css('position', 'absolute');
      }
      if (contentWidth > viewportWidth) {
        opts.msgContents.css('left', '0');
        opts.msgContents.css('position', 'absolute');
      }

      if (opts.isWindow && viewportHeight > contentHeight && viewportWidth > contentWidth) {
        opts.msgContents.css('position', 'fixed');
      }
    }

    opts.msgContents.show();
  }

  hide(): this {
    const opts = this.options;
    const doc = getDocument();
    const win = getWindow();

    if (!isBrowser() || !doc || !win) return this;

    if (opts.onBeforeHide) opts.onBeforeHide(opts.msgContext, opts.msgContents);

    if (opts.time) clearInterval(opts.time);
    if (opts.iTime) clearTimeout(opts.iTime);
    if (opts.resizeHandler) win.removeEventListener('resize', opts.resizeHandler);
    if (opts.keyupHandler) doc.removeEventListener('keyup', opts.keyupHandler);

    if (opts.modal && opts.windowScrollLock && this.scrollLockCleanup) {
      this.scrollLockCleanup();
      this.scrollLockCleanup = null;
    }

    if (!opts.isInput) {
      opts.msgContext.hide();
      if (opts.msgContents) {
        hideWithTransition(opts.msgContents).then(() => opts.onHide?.(opts.msgContext, opts.msgContents));
      }
    } else {
      if (opts.msgContents) {
        hideWithTransition(opts.msgContents).then(() => opts.onHide?.(opts.msgContext, opts.msgContents));
      }
    }

    return this;
  }

  remove(): this {
    const opts = this.options;
    const doc = getDocument();
    const win = getWindow();

    if (!isBrowser() || !doc || !win) return this;

    if (opts.onBeforeRemove) opts.onBeforeRemove(opts.msgContext, opts.msgContents);

    if (opts.time) clearInterval(opts.time);
    if (opts.iTime) clearTimeout(opts.iTime);
    if (opts.resizeHandler) win.removeEventListener('resize', opts.resizeHandler);
    if (opts.keyupHandler) doc.removeEventListener('keyup', opts.keyupHandler);

    if (this.dragCleanup) {
      this.dragCleanup();
      this.dragCleanup = null;
    }

    if (opts.modal && opts.windowScrollLock && this.scrollLockCleanup) {
      this.scrollLockCleanup();
      this.scrollLockCleanup = null;
    }

    if (!opts.isInput) {
      if (opts.msgContents) {
        hideWithTransition(opts.msgContents, true).then(() => {
          opts.msgContext.remove();
          opts.onRemove?.(opts.msgContext, opts.msgContents);
        });
      } else {
        opts.msgContext.remove();
        opts.onRemove?.(opts.msgContext, opts.msgContents);
      }
    } else {
      if (opts.msgContents) {
        hideWithTransition(opts.msgContents, true).then(() => opts.onRemove?.(opts.msgContext, opts.msgContents));
      }
    }

    return this;
  }
}

export function createAlert(
  target: NaturalElement | Element | Window,
  msgOrOptions?: AlertConstructorParam,
  vars?: string[]
): Alert {
  return new Alert(target, msgOrOptions, vars);
}
