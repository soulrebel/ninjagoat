import IRoutingAdapter from "./IRoutingAdapter";
import IViewModelRegistry from "../registry/IViewModelRegistry";
import AreaRegistry from "../registry/AreaRegistry";
import * as _ from "lodash";
import * as path from "path";
import {inject, injectable} from "inversify";
import * as Area from "../config/Area";
import IComponentFactory from "../components/IComponentFactory";
import {PlainRoute} from "react-router";
import {RouterState} from "react-router";
import {RedirectFunction} from "react-router";
import IRouteHook from "./IRouteHook";

@injectable()
class RoutingAdapter implements IRoutingAdapter {

    constructor(@inject("IViewModelRegistry") private registry:IViewModelRegistry,
                @inject("IComponentFactory") private componentFactory:IComponentFactory,
                @inject("IRouteHook") private hook:IRouteHook) {
    }

    routes():PlainRoute {
        let areas = this.registry.getAreas(),
            routes = this.getRoutes(areas);
        if (this.registry.getArea(Area.NotFound)) //If there's a 404 handler
            routes.push({
                path: "*",
                component: this.componentFactory.componentForNotFound()
            });
        return {
            childRoutes: routes,
            component: this.componentFactory.componentForMaster(),
            indexRoute: {component: this.componentFactory.componentForUri("/")},
            path: "/",
            onEnter: (nextState:RouterState, replace:RedirectFunction, callback: Function) => {
                let entry = this.registry.getArea("Index").entries[0];
                this.hook.enter(entry,  nextState).finally(() => callback());
            }
        };
    }

    private getRoutes(areas:AreaRegistry[]):PlainRoute[] {
        return <PlainRoute[]>_(areas)
            .filter(area => !_.includes([Area.Index, Area.Master, Area.NotFound], area.area))
            .reduce((routes, area) => {
                routes.push(this.getRoutesForArea(area));
                return _.flatten(routes);
            }, [])
            .valueOf();
    }

    private getRoutesForArea(area:AreaRegistry):{}[] {
        return <PlainRoute[]>_(area.entries)
            .reduce((routes, entry) => {
                let id = entry.id.indexOf(Area.Index) > -1 ? "" : entry.id.toLowerCase(),
                    route = path.join(area.area.toLowerCase(), id, entry.parameters || "");
                routes.push({
                    component: this.componentFactory.componentForUri(route),
                    path: route,
                    onEnter: (nextState:RouterState, replace:RedirectFunction, callback: Function) => {
                        this.hook.enter(entry,  nextState).finally(() => callback());
                    }
                });
                return routes;
            }, [])
            .valueOf();
    }
}

export default RoutingAdapter;
