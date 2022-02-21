import React from "react";
import { HttpError } from "../utils/HttpError";
import { ErrorFallbackUI } from "./ErrorFallbackUI";

type ErrorBoundaryProps = {
  onReset: () => void;
  fallbackUIWrapperClassName?: string;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | HttpError | null;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error | HttpError) {
    return {
      error,
    };
  }

  resetHandler = () => {
    this.setState({
      error: null,
    });
    this.props.onReset();
  };

  public render() {
    const { error } = this.state;
    const { children, fallbackUIWrapperClassName } = this.props;

    if (error) {
      if (error instanceof HttpError) {
        if (error.statusCode === 403) {
          return (
            <ErrorFallbackUI
              type="reset"
              message="페이지를 찾을 수 없습니다."
              wrapperClassName={fallbackUIWrapperClassName}
              onReset={this.resetHandler}
              resetButtonText="메인 페이지로 돌아가기"
            />
          );
        } else {
          return (
            <ErrorFallbackUI
              type="message"
              message="서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
              wrapperClassName={fallbackUIWrapperClassName}
            />
          );
        }
      } else {
        return (
          <ErrorFallbackUI
            type="reset"
            message="에러가 발생했습니다."
            wrapperClassName={fallbackUIWrapperClassName}
            onReset={this.resetHandler}
            resetButtonText="메인 페이지로 돌아가기"
          />
        );
      }
    }

    return children;
  }
}
