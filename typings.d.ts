declare module '*.less' {
    const content: { [className: string]: string };
    export default content;
}

type Result<T> = {
    status: number
    message: string
    data: T
}