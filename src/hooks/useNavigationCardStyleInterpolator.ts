import { useCallback } from "react";
import type {
  StackCardInterpolationProps,
  StackCardStyleInterpolator,
  StackCardInterpolatedStyle,
} from "@react-navigation/stack";

export const useNavigationCardStyleInterpolator =
  (): StackCardStyleInterpolator => {
    const interpolator = useCallback(
      (props: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        const { current, inverted, layouts } = props;
        return {
          cardStyle: {
            opacity: current.progress,
          },
        };
      },
      []
    );
    return interpolator;
  };
