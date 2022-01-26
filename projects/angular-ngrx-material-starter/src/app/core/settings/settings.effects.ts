import { ActivationEnd, Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, merge, of } from 'rxjs';
import {
  tap,
  withLatestFrom,
  distinctUntilChanged,
  filter
} from 'rxjs/operators';

import { selectSettingsState } from '../core.state';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AnimationsService } from '../animations/animations.service';
import { TitleService } from '../title/title.service';

import {
  actionSettingsChangeAnimationsElements,
  actionSettingsChangeAnimationsPage,
  actionSettingsChangeAnimationsPageDisabled,
  actionSettingsChangeAutoNightMode,
  actionSettingsChangeLanguage,
  actionSettingsChangeTheme,
  actionSettingsChangeStickyHeader,
  actionSettingsChangeHour
} from './settings.actions';
import {
  selectEffectiveTheme,
  selectSettingsLanguage,
  selectPageAnimations,
  selectElementsAnimations
} from './settings.selectors';
import { State } from './settings.model';

export const SETTINGS_KEY = 'SETTINGS';

const INIT = of('anms-init-effect-trigger');

@Injectable()
export class SettingsEffects {
  hour = 0;

  changeHour = this.ngZone.runOutsideAngular(() =>
    setInterval(() => {
      const hour = new Date().getHours();
      if (hour !== this.hour) { // 如果小时有改变，就发出一个通知 action.
        this.hour = hour;
        this.ngZone.run(() =>
          this.store.dispatch(actionSettingsChangeHour({ hour }))
        );
      }
    }, 60_000)
  );

  // 保存最新的 setting 数据到 localStorage 中.
  persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          actionSettingsChangeAnimationsElements,
          actionSettingsChangeAnimationsPage,
          actionSettingsChangeAnimationsPageDisabled,
          actionSettingsChangeAutoNightMode,
          actionSettingsChangeLanguage,
          actionSettingsChangeStickyHeader,
          actionSettingsChangeTheme
        ),
        withLatestFrom(this.store.pipe(select(selectSettingsState))),
        // tap 一般做一些不会修改结果的操作. 如保存，打印调试
        tap(([action, settings]) =>
          this.localStorageService.setItem(SETTINGS_KEY, settings)
        )
      ),
    { dispatch: false }
  );

  updateRouteAnimationType = createEffect(
    () =>
      merge(
        INIT,
        this.actions$.pipe(
          ofType(
            actionSettingsChangeAnimationsElements,
            actionSettingsChangeAnimationsPage
          )
        )
      ).pipe(
        withLatestFrom(
          combineLatest([
            this.store.pipe(select(selectPageAnimations)),
            this.store.pipe(select(selectElementsAnimations))
          ])
        ),
        tap(([action, [pageAnimations, elementsAnimations]]) =>
          this.animationsService.updateRouteAnimationType(
            pageAnimations,
            elementsAnimations
          )
        )
      ),
    { dispatch: false }
  );

  // actionSettingsChangeTheme: 主题改变后的触发(修改 overlayContainer 的 theme)
  updateTheme = createEffect(
    // 1.加上 INIT, 表示创建时就触发这个动作
    // 2.一旦收到 actionSettingsChangeTheme ， 也会触发.
    () =>
      merge(INIT, this.actions$.pipe(
        ofType(
          actionSettingsChangeTheme,
          actionSettingsChangeAutoNightMode
          )
        )).pipe(
        // 会组合上面的 action 和下面的 theme 名字. 都有值后才一起触发后面的订阅.
        withLatestFrom(this.store.pipe(select(selectEffectiveTheme))),
        tap(([action, effectiveTheme]) => {
          const classList =
            this.overlayContainer.getContainerElement().classList;
          const toRemove = Array.from(classList).filter((item: string) =>
            item.includes('-theme')
          );
          console.log('classList', classList); // cdk-overlay-container black-theme
          console.log('effectiveTheme:', effectiveTheme, ' action:' , action); // 如果选择了 black 主题: black-theme
          if (toRemove.length) {
            classList.remove(...toRemove);
          }
          classList.add(effectiveTheme);
        })
      ),
    { dispatch: false }
  );

  setTranslateServiceLanguage = createEffect(
    () =>
      this.store.pipe(
        select(selectSettingsLanguage),
        distinctUntilChanged(),
        tap((language) => this.translateService.use(language))
      ),
    { dispatch: false }
  );

  setTitle = createEffect(
    () =>
      merge(
        this.actions$.pipe(ofType(actionSettingsChangeLanguage)),
        this.router.events.pipe(
          filter((event) => event instanceof ActivationEnd)
        )
      ).pipe(
        tap(() => {
          this.titleService.setTitle(
            this.router.routerState.snapshot.root,
            this.translateService
          );
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private router: Router,
    private overlayContainer: OverlayContainer,
    private localStorageService: LocalStorageService,
    private titleService: TitleService,
    private animationsService: AnimationsService,
    private translateService: TranslateService,
    private ngZone: NgZone
  ) {
  }
}
