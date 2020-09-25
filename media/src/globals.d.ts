type InitialData = {
    staticUrl: string;
    baseUrl: string;
    currentUser: {
        [id: string]: string;
    };
}

declare const LocusTempus: InitialData;
