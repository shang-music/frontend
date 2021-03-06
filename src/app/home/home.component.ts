import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSelectChange, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, debounceTime, filter } from 'rxjs/operators';

import { ISearchItem } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { SearchService } from '../services/search.service';
import { IPlaylist } from '../services/song-list';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public searchValue = '';

  public searchList: ISearchItem[];
  public allPlaylist: IPlaylist[];
  public duration = 0;

  public peaks = [
    {
      name: '完整播放',
      duration: 0,
    },
    {
      name: '30s',
      duration: 20,
    },
    {
      name: '35s',
      duration: 25,
    },
    {
      name: '40s',
      duration: 30,
    },
    {
      name: '45s',
      duration: 35,
    },
    {
      name: '50s',
      duration: 40,
    },
    {
      name: '55s',
      duration: 45,
    },
    {
      name: '60s',
      duration: 50,
    },
    {
      name: '65s',
      duration: 55,
    },
    {
      name: '70s',
      duration: 60,
    },
  ];

  public playlistName = '';

  private homeUrl = '/';

  @ViewChild('sidenav')
  sidenav: MatSidenav;

  constructor(
    private readonly router: Router,
    private readonly searchService: SearchService,
    private readonly playerService: PlayerService
  ) {
    this.router.events
      .pipe(
        debounceTime(200),
        filter((e: any) => {
          return !!this.searchValue && e.url === this.homeUrl;
        }),
        catchError((e) => {
          console.warn(e);
          return of(false);
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.searchValue = '';
      });

    this.setPlaylistName();
  }

  ngOnInit() {
    this.duration = this.playerService.duration;

    this.searchService.searchSubject.pipe(untilDestroyed(this)).subscribe((value) => {
      if (value && this.router.url === this.homeUrl) {
        console.info('navigate to search');
        this.router.navigate(['search']);
      } else if (!value && this.router.url !== this.homeUrl) {
        console.info('navigate to home');
        this.router.navigate(['']);
      }
    });
  }

  inputKeyup(e: any) {
    this.searchService.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchService.searchSubject.next(this.searchValue);
  }

  selectionChange(e: MatSelectChange) {
    console.info(`change duration to ${e.value}`);

    this.playerService.changeConfig({ duration: e.value });
  }

  openedStart() {
    console.info('opend');

    this.allPlaylist = this.playerService.getPlaylists();

    console.info(this.allPlaylist);
  }

  playlistIdChange(id: string) {
    if (id !== this.playerService.currentPlaylistId) {
      this.playerService.pause();

      let rank = this.playerService.rankMap[id];
      if (rank) {
        this.playerService.changePlaylist(this.playerService.tempPlaylistId);
        this.playlistName = rank.name;
        this.loadRankPlaylist(id);
      } else {
        this.playerService.changePlaylist(id);
        this.setPlaylistName();
      }
    }

    this.sidenav.close();
  }

  loadRankPlaylist(id) {
    this.router.navigate(['search']);
    this.searchService.searchSubject.next(id);
  }

  ngOnDestroy(): void {}

  private setPlaylistName() {
    let playlist = this.playerService.getPlaylist();

    if (playlist) {
      this.playlistName = playlist.name;
    }
  }
}
