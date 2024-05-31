import { Component, ReactNode } from 'react';

import styles from './index.module.scss';
interface Properties {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: null | Error;
}

class ErrorBoundary extends Component<Properties, State> {
  constructor(properties: Properties | Readonly<Properties>) {
    super(properties);
    this.state = {
      hasError: false,
      // eslint-disable-next-line unicorn/no-null
      error: null,
    };
  }

  componentDidCatch(error: Error): void {
    this.setState({
      hasError: true,
      error,
    });
  }

  showText = (): string => {
    if (
      this.state.error &&
      this.state.error.toString() !== 'Error' &&
      this.state.error !== null
    ) {
      return this.state.error.toString();
    }
    return 'Something went wrong';
  };

  render(): React.ReactNode | null {
    if (this.state.hasError) {
      return (
        <>
          <section className={styles.page_404}>
            <div className={styles.content_box_404}>
              <h3>An error occurred.</h3>
              <p>Try refreshing the page</p>
              <a href="" className={styles.link_404}>
                Reload
              </a>
            </div>
          </section>
        </>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
