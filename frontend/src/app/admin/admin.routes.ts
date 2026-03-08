import { Route } from "@angular/router";
import { Dashboard } from "./dashboard/dashboard";
import { Media } from "./media/media";
import { MediaTypes } from "./media-types/media-types";
import { UserMediaRequests } from "./user-media-requests/user-media-requests";

export const routes: Route[] = [
    {
        path: '',
        component: Dashboard
    },
    {
        path: 'media',
        component: Media
    },
    {
        path: 'media-types',
        component: MediaTypes
    },
    {
        path: 'user-media-requests',
        component: UserMediaRequests
    }

]