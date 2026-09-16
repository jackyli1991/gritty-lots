import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('gritty-hello-lit')
export class HelloLitElement extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      color: #333;
      display: block;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      max-width: 300px;
      background-color: #f5f7fa;
    }
    ol,
    li {
      list-style: none;
    }
    * {
      margin: 0px;
      padding: 0px;
    }
    .header {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    p.large {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  `;

  // 内部状态（外部不可访问）
  @state()
  count = 0;
  items = [
    { id: 1, name: 'item1' },
    { id: 2, name: 'item2' },
    { id: 3, name: 'item3' },
  ];

  get isEven() {
    return this.count % 2 === 0;
  }

  get isOdd() {
    return this.count % 2 !== 0;
  }

  // Declare reactive properties
  @property({ type: String })
  name?: string = 'lit';

  // 查询 DOM 元素
  @query('ol')
  ol?: HTMLUListElement;

  // Define a template for the header
  headerTemplate() {
    return html`
      <h1 class="header">lit header: ${this.count} is ${this.isEven ? 'even' : 'odd'}</h1>
      <button @click=${this.onClick}>Click me</button>
    `;
  }

  onClick() {
    this.count++;
    console.log(this.ol);
  }

  firstUpdated() {
    console.log('web component lifecycle：firstUpdated');
  }
  willUpdate(changedProperties: any) {
    console.log('web component lifecycle：willUpdate', changedProperties);
  }
  shouldUpdate(changedProperties: any) {
    console.log('web component lifecycle：shouldUpdate', changedProperties);
    return true;
  }
  updated() {
    console.log('web component lifecycle：updated');
  }

  // Render the UI as a function of component state
  render() {
    return html`
      ${this.headerTemplate()}
      <p class=${classMap({ large: this.isEven })}>Hello, ${this.name}!</p>
      <slot name="footer"></slot>
      <!--渲染 nothing 时，不会生成任何 DOM 节点 -->
      ${nothing}
      <ol style=${styleMap({ color: this.isEven ? 'red' : 'green' })}>
        ${repeat(
          this.items,
          (item) => item.id,
          (item, index) => {
            return html`<li>${index}: ${item.name}</li>`;
          }
        )}
      </ol>
    `;
  }
}
