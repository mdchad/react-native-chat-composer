import { requireNativeView } from "expo";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import type {
  KeyboardComposerProps,
  KeyboardComposerRef,
  KeyboardComposerViewProps,
  TextEventPayload,
  HeightEventPayload,
} from "./KeyboardComposer.types";

// Imperative methods the native view exposes on its ref (via Expo Modules
// view AsyncFunctions). They resolve to promises natively; callers can ignore them.
type NativeComposerHandle = {
  focus: () => Promise<void> | void;
  blur: () => Promise<void> | void;
  clear: () => Promise<void> | void;
};

// Get the native view component
const NativeView = requireNativeView("KeyboardComposer") as React.ComponentType<
  KeyboardComposerViewProps & { ref?: React.Ref<NativeComposerHandle> }
>;

/**
 * KeyboardComposer - A native composer with pixel-perfect keyboard tracking.
 *
 * Uses native keyboard APIs for smooth keyboard animations that match
 * system apps like iMessage.
 *
 * @example
 * ```tsx
 * <KeyboardComposer
 *   placeholder="Type a message..."
 *   onSend={(text) => sendMessage(text)}
 *   onKeyboardHeightChange={(height) => setFooterHeight(height)}
 * />
 * ```
 */
const KeyboardComposerView = forwardRef<
  KeyboardComposerRef,
  KeyboardComposerProps
>((props, ref) => {
    const {
      onChangeText,
      onSend,
      onStop,
      onHeightChange,
      onKeyboardHeightChange,
      onComposerFocus,
      onComposerBlur,
      style,
      ...rest
    } = props;

    // Ref to the underlying native view. Expo Modules exposes the view's
    // AsyncFunctions (focus/blur/clear) as async methods on this ref.
    const nativeRef = useRef<NativeComposerHandle>(null);

    // Expose imperative methods to parent, forwarding to the native view.
    useImperativeHandle(ref, () => ({
      focus: () => {
        nativeRef.current?.focus?.();
      },
      blur: () => {
        nativeRef.current?.blur?.();
      },
      clear: () => {
        nativeRef.current?.clear?.();
      },
    }));

    // Event handlers that unwrap nativeEvent
    const handleChangeText = useCallback(
      (event: { nativeEvent: TextEventPayload }) => {
        onChangeText?.(event.nativeEvent.text);
      },
      [onChangeText]
    );

    const handleSend = useCallback(
      (event: { nativeEvent: TextEventPayload }) => {
        onSend?.(event.nativeEvent.text);
      },
      [onSend]
    );

    const handleStop = useCallback(() => {
      onStop?.();
    }, [onStop]);

    const handleHeightChange = useCallback(
      (event: { nativeEvent: HeightEventPayload }) => {
        onHeightChange?.(event.nativeEvent.height);
      },
      [onHeightChange]
    );

    const handleKeyboardHeightChange = useCallback(
      (event: { nativeEvent: HeightEventPayload }) => {
        onKeyboardHeightChange?.(event.nativeEvent.height);
      },
      [onKeyboardHeightChange]
    );

    const handleComposerFocus = useCallback(() => {
      onComposerFocus?.();
    }, [onComposerFocus]);

    const handleComposerBlur = useCallback(() => {
      onComposerBlur?.();
    }, [onComposerBlur]);

    return (
      <NativeView
        ref={nativeRef}
        // Default to filling the parent container (common usage is inside a fixed-height wrapper).
        // Without a style, React Native can lay this out at 0x0 on Android.
        style={[{ flex: 1, alignSelf: "stretch" }, style]}
        onChangeText={handleChangeText}
        onSend={handleSend}
        onStop={handleStop}
        onHeightChange={handleHeightChange}
        onKeyboardHeightChange={handleKeyboardHeightChange}
        onComposerFocus={handleComposerFocus}
        onComposerBlur={handleComposerBlur}
        {...rest}
      />
    );
});

KeyboardComposerView.displayName = "KeyboardComposerView";

export default KeyboardComposerView;
