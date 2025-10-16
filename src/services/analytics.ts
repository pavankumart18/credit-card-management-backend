type AnalyticsEvent = string
type AnalyticsProps = Record<string, unknown>

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('[analytics]', event, props || {})
    }
}

