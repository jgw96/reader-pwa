import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() answer: string | any = '';
  @state() document: any;
  @state() summary: string | any = '';

  static get styles() {
    return [
      styles,
      css`
      #textarea-section {
        display: flex;
        justify-content: center;
        /* align-items: center; */
        /* height: 90vh; */
        padding: 10px;
        overflow-y: hidden;
      }

      #question-box {
        min-height: 22vh;
        background: rgb(36, 36, 40);
        margin-bottom: 10px;
        border-radius: 8px;
        padding: 8px;
      }

      @media(prefers-color-scheme: light) {
        #question-box {
          background: rgb(255 255 255 / 62%);
        }
      }

      #card-list {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      #answer {
        width: 100%;
      }

      sl-textarea {
        flex: 1;
      }

      #control-bar {
        padding: 10px;

      }

      sl-textarea::part(base) {
        /* height: 88vh; */
        border-radius: 10px;
        border: none;
      }

      sl-card {
        width: 100%;
      }

      sl-textarea::part(textarea) {
        height: 80vh;
      }

      #wrapper {
        display: flex;
      }

      @media (max-width: 768px) {
        #wrapper {
          flex-direction: column-reverse;
        }

        #control-bar {
          position: fixed;
          bottom: 10px;
          z-index: 99;
          left: 10px;
          right: 10px;
          background: #2c2c2c7a;
          border-radius: 8px;
          backdrop-filter: blur(40px);
        }
      }

       #textarea-section {
        flex: 2;
        padding: 10px;

        transition: flex 0.5s ease-in-out;
       }

       #input-section {
         display: flex;
         flex-direction: column;
         gap: 8px;

         flex: 1;
         padding: 10px;

         animation: slideInFromRight 0.5s ease-in-out;
       }

       @keyframes slideInFromRight {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(0);
        }
       }
    `];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  async openFile() {
    const { fileOpen } = await import('browser-fs-access');
    const blob = await fileOpen({
      mimeTypes: ['text/*'],
    });

    if (blob) {
      const text = await blob.text();
      const textarea = this.shadowRoot?.querySelector('sl-textarea');
      textarea!.value = text;

      this.document = blob;

      this.doSummarize();

    }
  }

  async doSummarize() {
    const { summarize } = await import('../services/ai');
    const textarea = this.shadowRoot?.querySelector('sl-textarea');
    const context = textarea!.value;

    console.log("doing summary")
    const summary = await summarize(context);
    console.log("summary", summary);

    this.summary = summary;
  }

  async doQuestion() {
    const { askQuestion } = await import('../services/ai');
    const textarea = this.shadowRoot?.querySelector('sl-textarea');
    const input = this.shadowRoot?.querySelector('sl-input');
    const question = input!.value;
    const context = textarea!.value;
    const answer = await askQuestion(question, context);
    console.log("answer", answer);

    this.answer = answer;
  }

  async doText() {
    const { fileOpen } = await import('browser-fs-access');
    const blob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    const { getText } = await import('../services/ai');
    const data = await getText(blob);
    console.log("text-data", data);

    const textarea = this.shadowRoot?.querySelector('sl-textarea');
    textarea!.value = data.readResult.content

    this.document = blob;

    this.doSummarize();
  }

  render() {
    return html`
      <app-header></app-header>

      <main>
      <div id="control-bar">
            <sl-button variant="primary" @click="${() => this.openFile()}">Open Document</sl-button>
            <sl-button @click="${() => this.doText()}">Get text from photo</sl-button>
          </div>

          <div id="wrapper">
        <div id="textarea-section">

          <sl-textarea placeholder="Open a document"></sl-textarea>
        </div>


       <div id="input-section">

       ${this.summary ? html`<sl-card id="summary">
            <div slot="header">
              Summary
  </div>
            <p>${this.summary}</p>
  </sl-card>` : null}

       <div id="question-box">
          <sl-input placeholder="Ask a Question" @sl-change="${() => this.doQuestion()}"></sl-input>

          <div id="card-list">
          ${this.answer.length > 0 ? html`<sl-card id="answer">
            <div slot="header">
              Answer
  </div>
            <p>${this.answer}</p>
  </sl-card>` : null}
  </div>
  </div>
  </div>
        </div>
  </div>

      </main>
    `;
  }
}
