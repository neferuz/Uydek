interface Window {
    Telegram?: { 
        WebApp?: { 
            initData: string; 
            initDataUnsafe: any; 
            version: string; 
            platform: string;
            colorScheme: string;
            themeParams: any;
            isActive?: boolean;
            isExpanded: boolean; 
            viewportHeight: number; 
            viewportStableHeight: number; 
            headerColor?: string;
            backgroundColor?: string;
            bottomBarColor?: string;
            isClosingConfirmationEnabled?: boolean;
            isVerticalSwipesEnabled?: boolean;
            isFullscreen?: boolean;
            isOrientationLocked?: boolean;
            safeAreaInset?: any;
            contentSafeAreaInset?: any;

            BackButton: any; 
            MainButton: any; 
            SecondaryButton?: any;
            SettingsButton?: any;
            HapticFeedback: any; 
            CloudStorage?: any;
            BiometricManager?: any;
            Accelerometer?: any;
            DeviceOrientation?: any;
            Gyroscope?: any;
            LocationManager?: any;
            DeviceStorage?: any;
            SecureStorage?: any;

            isVersionAtLeast(version: string): boolean; 
            setHeaderColor(color: string): void; 
            setBackgroundColor(color: string): void; 
            setBottomBarColor?(color: string): void;
            enableClosingConfirmation?(): void;
            disableClosingConfirmation?(): void;
            requestFullscreen?(): void; 
            exitFullscreen?(): void;
            lockOrientation?(): void;
            unlockOrientation?(): void;
            addToHomeScreen?(): void;
            checkHomeScreenStatus?(callback?: (status: string) => void): void;
            onEvent(eventType: string, callback: (...args: any[]) => void): void; 
            offEvent(eventType: string, callback: (...args: any[]) => void): void; 
            sendData(data: any): void; 
            switchInlineQuery?(query: string, choose_chat_types?: string[]): void;
            openLink(url: string, options?: { try_instant_view?: boolean }): void;
            openTelegramLink(url: string): void; 
            openInvoice(url: string, callback?: (status: string) => void): void;
            shareToStory?(media_url: string, params?: any): void;
            shareMessage?(msg_id: string, callback?: (sent: boolean) => void): void;
            setEmojiStatus?(custom_emoji_id: string, params?: any, callback?: (set: boolean) => void): void;
            requestEmojiStatusAccess?(callback?: (granted: boolean) => void): void;
            downloadFile?(params: any, callback?: (accepted: boolean) => void): void;
            showPopup(params: any, callback?: (id?: string) => void): void;
            showAlert(message: string, callback?: () => void): void;
            showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
            showScanQrPopup?(params: any, callback?: (text: string) => void): void;
            closeScanQrPopup?(): void;
            readTextFromClipboard?(callback?: (text: string) => void): void;
            requestWriteAccess?(callback?: (granted: boolean) => void): void;
            requestContact?(callback?: (shared: boolean) => void): void;
            ready(): void; 
            expand(): void; 
            close(): void; 
            setSwipeToDismiss?(enabled: boolean): void; 

            viewport: {
                expand(): void;
                ready(): void;
                onEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
                offEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
                enableVerticalSwipes(): void;
                disableVerticalSwipes(): void;
                height: number;
                stableHeight: number;
                is_expanded: boolean;
                is_keyboard_visible: boolean;
            };
        };
    };
} 