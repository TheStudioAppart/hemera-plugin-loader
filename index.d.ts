interface Loader {
    handlers: string, // path
    da: string, // data-access path,
    communicator: string,

    setHandlers: 
    /**
     * setHandlers
     */
    setHandlers(path: string): any;
}

declare namespace Loader {
    interface Constructor{
    
    }
}