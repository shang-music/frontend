import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HammerInput, MatDialog, MatMenuTrigger } from '@angular/material';
import { filter, map } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';

import { IPlaylist } from '../../services/song-list';
import { PlaylistCreateComponent } from '../playlist-create/playlist-create.component';

@Component({
  selector: 'app-playlist-control',
  templateUrl: './playlist-control.component.html',
  styleUrls: ['./playlist-control.component.scss'],
})
export class PlaylistControlComponent implements OnInit {
  @Input()
  allPlaylist: IPlaylist[];

  @ViewChild(MatMenuTrigger)
  operationMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  constructor(private matDialog: MatDialog, private playerService: PlayerService) {}

  ngOnInit() {}

  create() {
    let data = {};
    const dialogRef = this.matDialog.open(PlaylistCreateComponent, { data });

    dialogRef
      .afterClosed()
      .pipe(
        map((item) => {
          return item || {};
        }),
        filter(({ name }) => {
          return !!name;
        })
      )
      .subscribe(({ name }) => {
        this.playerService.createPlaylist(name);

        this.allPlaylist = this.playerService.getPlaylists();
      });
  }

  press(event: HammerInput, item: IPlaylist) {
    console.info('pressed', event, item);
    event.preventDefault();

    if (item.id === this.playerService.tempPlaylistId) {
      return null;
    }

    this.contextMenuPosition.x = event.center.x + 'px';
    this.contextMenuPosition.y = event.center.y + 'px';

    this.operationMenu.menuData = { item };
    this.operationMenu.openMenu();
  }

  changePlaylist({ id }: IPlaylist) {
    console.info('changePlaylist: ', id);
    this.playerService.changePlaylist(id);
    this.playerService.pause();
  }

  delete(item: IPlaylist) {
    console.log('item: ', item);

    this.playerService.removePlaylist(item.id);
    this.allPlaylist = this.playerService.getPlaylists();
  }
}