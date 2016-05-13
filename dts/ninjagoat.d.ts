/// <reference path="../typings/browser.d.ts" />

import {IKernelModule, INewable, IKernel} from "inversify";
import * as Rx from "rx";
import * as React from "react";

declare module ninjagoat {

    export class Application {
        run(overrides?:any);

        register(module:IModule);
    }

    export interface IModule {
        modules?:IKernelModule;
        register(registry:IViewModelRegistry, serviceLocator?:IServiceLocator, overrides?:any):void;
    }

    export interface IServiceLocator {
        get<T>(key:string):T;
    }

    export interface IViewModelRegistry {
        master<T>(constructor:INewable<IViewModel<T>>, observable?:(context:ViewModelContext) => Rx.IObservable<T>):AreaRegistry;
        index<T>(constructor:INewable<IViewModel<T>>, observable?:(context:ViewModelContext) => Rx.IObservable<T>):AreaRegistry;
        add<T>(constructor:INewable<IViewModel<T>>, observable?:(context:ViewModelContext) => Rx.IObservable<T>, parameters?:string):IViewModelRegistry;
        forArea(area:string):AreaRegistry;
        getArea(areaId:string):AreaRegistry;
        getAreas():AreaRegistry[];
        getEntry<T>(area:string, id:string):RegistryEntry<T>;
    }

    export class AreaRegistry {
        area:string;
        entries:RegistryEntry<IViewModel<any>>[];
    }

    export class RegistryEntry<T> {
        construct:INewable<IViewModel<T>>;
        id:string;
        observableFactory:(context:ViewModelContext) => Rx.IObservable<T>;
        parameters:string;
    }

    export class ViewModelContext {
        area:string;
        viewmodelId:string;
        parameters:any;
    }

    export interface IViewModel<T> extends Rx.IDisposable, Rx.IObservable<void> {
        "force nominal type for IViewModel":T;
    }

    export abstract class ObservableViewModel<T> implements IViewModel<T> {
        "force nominal type for IViewModel":T;

        subscribe(observer:Rx.IObserver<void>):Rx.IDisposable
        subscribe(onNext?:(value:void) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable;

        dispose():void
    }

    export abstract class View<T> extends React.Component<{ viewmodel:T }, {}> {
        public viewModel:T;

        abstract render();
    }

    export function ViewModel(name:string);

    export function Refresh(target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>);

    export class ModelState<T> {
        phase:ModelPhase;
        model:T;
        failure:any;

        static Loading<T>():ModelState<T>;

        static Ready<T>(model:T):ModelState<T>;

        static Failed<T>(failure:any):ModelState<T>;
    }

    export enum ModelPhase {
        Loading,
        Ready,
        Failed
    }


    interface ICommandDispatcher {
        dispatch(command:Command):void;
    }

    export class Command {

    }

    export interface CommandDecoratorsStatic {
        Authentication(type:string)
        Endpoint(endpoint:string)
        Transport(type:string)
    }

    export var CommandDecorators:CommandDecoratorsStatic;

    export abstract class CommandDispatcher implements ICommandDispatcher {
        dispatch(command:Command):void;

        abstract internalExecute(command:Command):boolean;

        setNext(dispatcher:ICommandDispatcher):void;
    }

    export interface AuthenticationStatic {
        Bearer:string;
        Basic:string;
    }

    export var Authentication:AuthenticationStatic;

    export interface TransportStatic {
        HTTP_Post:string,
        WebSocket:string
    }

    export var Transport:TransportStatic;

    export interface IHttpClient {
        get(url:string, headers?:{}):Rx.Observable<HttpResponse>
        post(url:string, body:any, headers?:{}):Rx.Observable<HttpResponse>
        put(url:string, body:any, headers?:{}):Rx.Observable<HttpResponse>
        delete(url:string, headers?:{}):Rx.Observable<HttpResponse>
    }

    export class HttpResponse {
        response:any;
        headers:{};
    }

    export interface IModelRetriever {
        modelFor<T>(context:ViewModelContext):Rx.Observable<ModelState<T>>;
    }

    export class ModelRetriever implements IModelRetriever {
        modelFor<T>(context:ViewModelContext):Rx.Observable<ModelState<T>>;
    }
}

export = ninjagoat;