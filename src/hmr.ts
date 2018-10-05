declare let FuseBox: any;

export class MyHmrReloader {
    private isRegistered: boolean = false;
    private callbacks: Function[] = [];

    constructor() {
        this.register();
    }

    clearCallbacks() {
        return this.callbacks = [];
    }

    addCallback(callback: Function) {
        this.callbacks.push(callback);
    }

    hmrUpdate({ type, path, content, dependants }) {
      // Dependants only available when emitHMRDependencies = true
        if( type === "js") {
            console.log(content);
            FuseBox.dynamic(path, content);
            FuseBox.flush();
            
            if (FuseBox.mainFile) {
                FuseBox.import(FuseBox.mainFile);
            }
            console.log("MyHmrReloader: Making callbacks")
            this.callbacks.map(x => x());
            return true;
        }
    }

    private register() {
        if( this.isRegistered ) {
            return;
        }
        FuseBox.addPlugin(this);
        this.isRegistered = true;
    }
};