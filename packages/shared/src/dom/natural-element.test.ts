import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NaturalElement, $ } from './natural-element';

describe('NaturalElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Constructor and Selection', () => {
    it('should create empty collection for null/undefined', () => {
      expect($(null).length).toBe(0);
      expect($(undefined).length).toBe(0);
    });

    it('should select elements by CSS selector', () => {
      document.body.innerHTML = '<div class="test"></div><div class="test"></div>';
      const elements = $('.test');
      expect(elements.length).toBe(2);
    });

    it('should wrap single Element', () => {
      const div = document.createElement('div');
      const elements = $(div);
      expect(elements.length).toBe(1);
      expect(elements.get(0)).toBe(div);
    });

    it('should wrap Element array', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const elements = $([div1, div2]);
      expect(elements.length).toBe(2);
    });

    it('should wrap NodeList', () => {
      document.body.innerHTML = '<div class="test"></div><div class="test"></div>';
      const nodeList = document.querySelectorAll('.test');
      const elements = $(nodeList);
      expect(elements.length).toBe(2);
    });

    it('should wrap another NaturalElement', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const original = $('.test');
      const wrapped = $(original);
      expect(wrapped.length).toBe(1);
    });

    it('should create elements from HTML string', () => {
      const elements = $('<div class="new">Hello</div>');
      expect(elements.length).toBe(1);
      expect(elements.hasClass('new')).toBe(true);
    });
  });

  describe('Array-like Methods', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="a"></div><div id="b"></div><div id="c"></div>';
    });

    it('should get element by index', () => {
      const elements = $('div');
      expect((elements.get(0) as Element)?.id).toBe('a');
      expect((elements.get(1) as Element)?.id).toBe('b');
      expect((elements.get(-1) as Element)?.id).toBe('c');
    });

    it('should get all elements as array when no index provided', () => {
      const elements = $('div');
      const arr = elements.get() as Element[];
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(3);
    });

    it('should return NaturalElement with eq()', () => {
      const elements = $('div');
      const second = elements.eq(1);
      expect(second instanceof NaturalElement).toBe(true);
      expect(second.length).toBe(1);
      expect((second.get(0) as Element)?.id).toBe('b');
    });

    it('should get first element', () => {
      const elements = $('div');
      expect((elements.first().get(0) as Element)?.id).toBe('a');
    });

    it('should get last element', () => {
      const elements = $('div');
      expect((elements.last().get(0) as Element)?.id).toBe('c');
    });

    it('should iterate with each()', () => {
      const elements = $('div');
      const ids: string[] = [];
      elements.each((i, el) => {
        ids.push(el.id);
      });
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('should break iteration when callback returns false', () => {
      const elements = $('div');
      const ids: string[] = [];
      elements.each((i, el) => {
        ids.push(el.id);
        if (i === 1) return false;
      });
      expect(ids).toEqual(['a', 'b']);
    });

    it('should map elements', () => {
      const elements = $('div');
      const ids = elements.map((i, el) => el.id);
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('should convert to array', () => {
      const elements = $('div');
      const arr = elements.toArray();
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(3);
    });

    it('should get index of element', () => {
      document.body.innerHTML = '<ul><li id="a"></li><li id="b"></li><li id="c"></li></ul>';
      const items = $('li');
      const b = $('#b');
      expect(items.index(b)).toBe(1);
    });

    it('should get index relative to parent when no argument', () => {
      document.body.innerHTML = '<ul><li id="a"></li><li id="b"></li><li id="c"></li></ul>';
      expect($('#b').index()).toBe(1);
    });
  });

  describe('Finding and Filtering', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="container">
          <span class="item active"></span>
          <span class="item"></span>
          <span class="other"></span>
        </div>
      `;
    });

    it('should find descendants', () => {
      const container = $('.container');
      const items = container.find('.item');
      expect(items.length).toBe(2);
    });

    it('should filter by selector', () => {
      const spans = $('span');
      const items = spans.filter('.item');
      expect(items.length).toBe(2);
    });

    it('should filter by function', () => {
      const spans = $('span');
      const filtered = spans.filter((i, el) => el.classList.contains('active'));
      expect(filtered.length).toBe(1);
    });

    it('should exclude with not()', () => {
      const spans = $('span');
      const notItems = spans.not('.item');
      expect(notItems.length).toBe(1);
      expect(notItems.hasClass('other')).toBe(true);
    });

    it('should check if matches selector with is()', () => {
      const active = $('.active');
      expect(active.is('.item')).toBe(true);
      expect(active.is('.container')).toBe(false);
    });

    it('should check if has child with has()', () => {
      const container = $('.container');
      expect(container.has('.item').length).toBe(1);
    });
  });

  describe('DOM Traversal', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="grandparent">
          <div class="parent">
            <div class="prev"></div>
            <div class="target"></div>
            <div class="next"></div>
          </div>
        </div>
      `;
    });

    it('should get parent', () => {
      const target = $('.target');
      expect(target.parent().hasClass('parent')).toBe(true);
    });

    it('should filter parent by selector', () => {
      const target = $('.target');
      expect(target.parent('.grandparent').length).toBe(0);
      expect(target.parent('.parent').length).toBe(1);
    });

    it('should get all parents', () => {
      const target = $('.target');
      const parents = target.parents();
      expect(parents.length).toBeGreaterThan(1);
    });

    it('should filter parents by selector', () => {
      const target = $('.target');
      const grandparents = target.parents('.grandparent');
      expect(grandparents.length).toBe(1);
    });

    it('should get closest ancestor', () => {
      const target = $('.target');
      expect(target.closest('.grandparent').length).toBe(1);
    });

    it('should get children', () => {
      const parent = $('.parent');
      expect(parent.children().length).toBe(3);
    });

    it('should filter children by selector', () => {
      const parent = $('.parent');
      expect(parent.children('.target').length).toBe(1);
    });

    it('should get siblings', () => {
      const target = $('.target');
      expect(target.siblings().length).toBe(2);
    });

    it('should filter siblings by selector', () => {
      const target = $('.target');
      expect(target.siblings('.prev').length).toBe(1);
    });

    it('should get next sibling', () => {
      const target = $('.target');
      expect(target.next().hasClass('next')).toBe(true);
    });

    it('should get previous sibling', () => {
      const target = $('.target');
      expect(target.prev().hasClass('prev')).toBe(true);
    });
  });

  describe('Content Manipulation', () => {
    it('should get and set innerHTML', () => {
      document.body.innerHTML = '<div class="test">Original</div>';
      const el = $('.test');

      expect(el.html()).toBe('Original');

      el.html('<span>New</span>');
      expect(el.html()).toBe('<span>New</span>');
    });

    it('should get and set textContent', () => {
      document.body.innerHTML = '<div class="test">Original</div>';
      const el = $('.test');

      expect(el.text()).toBe('Original');

      el.text('New Text');
      expect(el.text()).toBe('New Text');
    });

    it('should get and set input value', () => {
      document.body.innerHTML = '<input type="text" class="test" value="original">';
      const el = $('.test');

      expect(el.val()).toBe('original');

      el.val('new value');
      expect(el.val()).toBe('new value');
    });

    it('should append content', () => {
      document.body.innerHTML = '<div class="test"><span>A</span></div>';
      const el = $('.test');

      el.append('<span>B</span>');
      expect(el.children().length).toBe(2);
      expect((el.children().last().get(0) as Element)?.textContent).toBe('B');
    });

    it('should prepend content', () => {
      document.body.innerHTML = '<div class="test"><span>A</span></div>';
      const el = $('.test');

      el.prepend('<span>B</span>');
      expect(el.children().length).toBe(2);
      expect((el.children().first().get(0) as Element)?.textContent).toBe('B');
    });

    it('should insert before', () => {
      document.body.innerHTML = '<div class="container"><div class="target"></div></div>';
      $('.target').before('<div class="before"></div>');
      expect($('.container').children().first().hasClass('before')).toBe(true);
    });

    it('should insert after', () => {
      document.body.innerHTML = '<div class="container"><div class="target"></div></div>';
      $('.target').after('<div class="after"></div>');
      expect($('.container').children().last().hasClass('after')).toBe(true);
    });

    it('should remove elements', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');
      el.remove();
      expect($('.test').length).toBe(0);
    });

    it('should empty elements', () => {
      document.body.innerHTML = '<div class="test"><span>A</span><span>B</span></div>';
      const el = $('.test');
      el.empty();
      expect(el.html()).toBe('');
    });

    it('should clone elements', () => {
      document.body.innerHTML = '<div class="test" id="original">Content</div>';
      const clone = $('.test').clone();
      expect(clone.length).toBe(1);
      expect(clone.text()).toBe('Content');
    });

    it('should replace elements', () => {
      document.body.innerHTML = '<div class="old">Old</div>';
      $('.old').replaceWith('<div class="new">New</div>');
      expect($('.old').length).toBe(0);
      expect($('.new').length).toBe(1);
    });

    it('should wrap elements', () => {
      document.body.innerHTML = '<div class="target">Content</div>';
      $('.target').wrap('<div class="wrapper"></div>');
      expect($('.wrapper').children().hasClass('target')).toBe(true);
    });

    it('should unwrap elements', () => {
      document.body.innerHTML = '<div class="wrapper"><div class="target">Content</div></div>';
      $('.target').unwrap();
      expect($('.wrapper').length).toBe(0);
      expect($('.target').length).toBe(1);
    });
  });

  describe('Attribute and Property Manipulation', () => {
    it('should get and set attributes', () => {
      document.body.innerHTML = '<div class="test" data-value="original"></div>';
      const el = $('.test');

      expect(el.attr('data-value')).toBe('original');

      el.attr('data-value', 'new');
      expect(el.attr('data-value')).toBe('new');
    });

    it('should set multiple attributes', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.attr({ 'data-a': '1', 'data-b': '2' });
      expect(el.attr('data-a')).toBe('1');
      expect(el.attr('data-b')).toBe('2');
    });

    it('should remove attributes', () => {
      document.body.innerHTML = '<div class="test" data-value="test"></div>';
      const el = $('.test');

      el.removeAttr('data-value');
      expect(el.attr('data-value')).toBeNull();
    });

    it('should get and set properties', () => {
      document.body.innerHTML = '<input type="checkbox" class="test">';
      const el = $('.test');

      expect(el.prop('checked')).toBe(false);

      el.prop('checked', true);
      expect(el.prop('checked')).toBe(true);
    });

    it('should get and set data', () => {
      document.body.innerHTML = '<div class="test" data-initial="value"></div>';
      const el = $('.test');

      expect(el.data('initial')).toBe('value');

      el.data('custom', { key: 'value' });
      expect(el.data('custom')).toEqual({ key: 'value' });
    });

    it('should get all data', () => {
      document.body.innerHTML = '<div class="test" data-a="1"></div>';
      const el = $('.test');
      el.data('b', '2');

      const allData = el.data();
      expect(allData).toHaveProperty('a', '1');
      expect(allData).toHaveProperty('b', '2');
    });

    it('should remove data', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.data('key', 'value');
      expect(el.data('key')).toBe('value');

      el.removeData('key');
      expect(el.data('key')).toBeUndefined();
    });
  });

  describe('CSS and Class Manipulation', () => {
    it('should get computed style', () => {
      document.body.innerHTML = '<div class="test" style="color: rgb(255, 0, 0);"></div>';
      const el = $('.test');
      expect(el.css('color')).toBe('rgb(255, 0, 0)');
    });

    it('should set single style', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');
      el.css('background-color', 'blue');
      expect((el.get(0) as HTMLElement)?.style.backgroundColor).toBe('blue');
    });

    it('should set multiple styles', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');
      el.css({ 'background-color': 'red', padding: '10px' });
      const style = (el.get(0) as HTMLElement)?.style;
      expect(style?.backgroundColor).toBe('red');
      expect(style?.padding).toBe('10px');
    });

    it('should add class', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');
      el.addClass('new-class');
      expect(el.hasClass('new-class')).toBe(true);
    });

    it('should add multiple classes', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');
      el.addClass('class1 class2');
      expect(el.hasClass('class1')).toBe(true);
      expect(el.hasClass('class2')).toBe(true);
    });

    it('should remove class', () => {
      document.body.innerHTML = '<div class="test remove-me"></div>';
      const el = $('.test');
      el.removeClass('remove-me');
      expect(el.hasClass('remove-me')).toBe(false);
    });

    it('should toggle class', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.toggleClass('toggled');
      expect(el.hasClass('toggled')).toBe(true);

      el.toggleClass('toggled');
      expect(el.hasClass('toggled')).toBe(false);
    });

    it('should force toggle class', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.toggleClass('forced', true);
      expect(el.hasClass('forced')).toBe(true);

      el.toggleClass('forced', true);
      expect(el.hasClass('forced')).toBe(true);
    });
  });

  describe('Dimensions', () => {
    // Note: jsdom doesn't perform actual layout calculations, so offsetWidth/Height return 0.
    // These tests verify the methods exist and return numbers without throwing errors.

    it('should get width and height (returns 0 in jsdom)', () => {
      document.body.innerHTML =
        '<div class="test" style="width: 100px; height: 50px; display: block;"></div>';
      const el = $('.test');
      // In jsdom, offsetWidth/Height are always 0 since no real layout occurs
      expect(typeof el.width()).toBe('number');
      expect(typeof el.height()).toBe('number');
    });

    it('should get inner dimensions (returns 0 in jsdom)', () => {
      document.body.innerHTML =
        '<div class="test" style="width: 100px; height: 50px; padding: 10px; display: block;"></div>';
      const el = $('.test');
      // In jsdom, clientWidth/Height are always 0 since no real layout occurs
      expect(typeof el.innerWidth()).toBe('number');
      expect(typeof el.innerHeight()).toBe('number');
    });

    it('should get outer dimensions (returns 0 in jsdom)', () => {
      document.body.innerHTML =
        '<div class="test" style="width: 100px; height: 50px; margin: 10px; display: block;"></div>';
      const el = $('.test');
      // In jsdom, offsetWidth/Height are always 0 since no real layout occurs
      expect(typeof el.outerWidth()).toBe('number');
      expect(typeof el.outerHeight(true)).toBe('number');
    });
  });

  describe('Position and Offset', () => {
    it('should get position', () => {
      document.body.innerHTML =
        '<div class="parent" style="position: relative;"><div class="test" style="position: absolute; top: 10px; left: 20px;"></div></div>';
      const pos = $('.test').position();
      expect(pos).toHaveProperty('top');
      expect(pos).toHaveProperty('left');
    });

    it('should get offset', () => {
      document.body.innerHTML =
        '<div class="test" style="position: absolute; top: 10px; left: 20px;"></div>';
      const offset = $('.test').offset();
      expect(offset).toHaveProperty('top');
      expect(offset).toHaveProperty('left');
    });

    it('should get and set scroll position', () => {
      document.body.innerHTML =
        '<div class="test" style="overflow: auto; height: 100px;"><div style="height: 500px;"></div></div>';
      const el = $('.test');

      expect(el.scrollTop()).toBe(0);

      el.scrollTop(50);
      expect(el.scrollTop()).toBe(50);
    });
  });

  describe('Event Handling', () => {
    it('should bind and trigger events', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler = vi.fn();

      el.on('click', handler);
      el.trigger('click');

      expect(handler).toHaveBeenCalled();
    });

    it('should bind events with namespace', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler = vi.fn();

      el.on('click.myns', handler);
      el.trigger('click');

      expect(handler).toHaveBeenCalled();
    });

    it('should unbind events', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler = vi.fn();

      el.on('click', handler);
      el.off('click');
      el.trigger('click');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should unbind namespaced events', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      el.on('click.ns1', handler1);
      el.on('click.ns2', handler2);
      el.off('click.ns1');
      el.trigger('click');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle one-time events', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler = vi.fn();

      el.one('click', handler);
      el.trigger('click');
      el.trigger('click');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should delegate events', () => {
      document.body.innerHTML = '<div class="container"><button class="btn">Click</button></div>';
      const container = $('.container');
      const handler = vi.fn();

      container.on('click', '.btn', handler);
      $('.btn').trigger('click');

      expect(handler).toHaveBeenCalled();
    });

    it('should provide click shorthand', () => {
      document.body.innerHTML = '<button class="test">Click</button>';
      const el = $('.test');
      const handler = vi.fn();

      el.click(handler);
      el.click();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Visibility', () => {
    it('should show elements', () => {
      document.body.innerHTML = '<div class="test" style="display: none;"></div>';
      const el = $('.test');

      el.show();
      expect((el.get(0) as HTMLElement)?.style.display).not.toBe('none');
    });

    it('should hide elements', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.hide();
      expect((el.get(0) as HTMLElement)?.style.display).toBe('none');
    });

    it('should toggle visibility', () => {
      document.body.innerHTML = '<div class="test"></div>';
      const el = $('.test');

      el.toggle();
      expect((el.get(0) as HTMLElement)?.style.display).toBe('none');

      el.toggle();
      expect((el.get(0) as HTMLElement)?.style.display).not.toBe('none');
    });
  });

  describe('Merge and Add', () => {
    it('should add elements to collection', () => {
      document.body.innerHTML = '<div class="a"></div><div class="b"></div>';
      const a = $('.a');
      const combined = a.add('.b');
      expect(combined.length).toBe(2);
    });

    it('should slice elements', () => {
      document.body.innerHTML =
        '<div class="item"></div><div class="item"></div><div class="item"></div>';
      const items = $('.item');
      const sliced = items.slice(1, 2);
      expect(sliced.length).toBe(1);
    });
  });

  describe('Static Methods', () => {
    it('should check if object is NaturalElement', () => {
      const el = $('<div></div>');
      expect($.isNaturalElement(el)).toBe(true);
      expect($.isNaturalElement({})).toBe(false);
    });

    it('should extend objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = $.extend(target, source);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should deep extend objects', () => {
      const target = { nested: { a: 1 } };
      const source = { nested: { b: 2 } };
      const result = $.deepExtend(target, source);
      expect(result.nested).toEqual({ a: 1, b: 2 });
    });

    it('should parse HTML', () => {
      const elements = $.parseHTML('<div class="parsed"></div>');
      expect(elements.length).toBe(1);
      expect(elements[0]?.classList.contains('parsed')).toBe(true);
    });

    it('should execute callback on ready', () => {
      const callback = vi.fn();
      $.ready(callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Chaining', () => {
    it('should support method chaining', () => {
      document.body.innerHTML = '<div class="test"></div>';

      const result = $('.test')
        .addClass('active')
        .attr('data-value', '123')
        .css('color', 'red')
        .html('Content');

      expect(result instanceof NaturalElement).toBe(true);
      expect(result.hasClass('active')).toBe(true);
      expect(result.attr('data-value')).toBe('123');
      expect(result.html()).toBe('Content');
    });
  });
});

