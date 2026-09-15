import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gritty-hello-lit')
export class HelloLitElement extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      color: blue;
    }
  `;

  // Declare reactive properties
  @property()
  name?: string = 'lit';

  // Render the UI as a function of component state
  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
