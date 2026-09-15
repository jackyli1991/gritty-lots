class GrittyShadowWebComponent extends HTMLElement {
  // 声明需要监听的属性列表
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    // 挂载 Shadow DOM
    // mode: open → 外部js可以访问 shadowRoot
    // mode: closed → 外部拿不到shadowRoot引用（仅隐藏DOM，不是安全防护）
    this.attachShadow({ mode: 'open' });
  }

  // 组件挂载到页面时触发
  connectedCallback() {
    this.render();
  }

  // 属性变化触发
  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title') || '默认标题';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          max-width: 300px;
          background-color: #f5f7fa;
        }
        .content {
          padding: 6px;
        }

        .title {
          font-size:18px;
          font-weight: bold;
          margin:0 0 8px;
          color: purple;
        }
      </style>
      <div class="content">
        <div class="title">${title}</div>
        <!-- slot 插槽，接收外部传入子节点 -->
        使用 slot 分发内容: <slot></slot>
      </div>
    `;
  }
}

// 注册自定义标签，名字必须包含短横线 -
customElements.define('gritty-shadow-web-component', GrittyShadowWebComponent);
