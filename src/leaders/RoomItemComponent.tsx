import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {Environment} from "../common/Environment";
import {Component, h} from "preact";
import {RoomModel} from '../../server/models/RoomModel';
import {BehaviorSubject} from 'rxjs/index';
import {Maybe} from "../common/helpers/Maybe";

interface IComponentState {
    name: string;
}

interface IComponentProps {
    name: string;
    room: RoomModel;
    update$: BehaviorSubject<any>;
}

export class RoomItemComponent extends Component<IComponentProps, IComponentState> {
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;

    render(props: IComponentProps, state) {

        return (
            <div class="room-item">
                <div class="room-item-name">{props.room.title}</div>

                <div class="players">
                    <div class="players-item left">
                        <div class="title">Левый игрок:</div>
                        {this.renderClientStatus(props.room, 'left')}
                    </div>

                    <div class="players-item-versus">vs</div>

                    <div class="players-item right">
                        <div class="title">Правый игрок:</div>
                        {this.renderClientStatus(props.room, 'right')}
                    </div>
                </div>

                <div class="title">Зрители:</div>

                <div class="watchers">
                    <div className="watchers-count">{props.room.watchersCount}</div>
                    <a href={this.generateLInk('master')} target="_blank">Присоединиться</a>
                </div>

                <button class="sample-button" onClick={this.removeRoom}>Удалить</button>
            </div>
        )
    }

    removeRoom = () => {
        this.apiService.deleteRoom(this.props.name)
            .subscribe(() => {
                this.props.update$.next(this.props.room);
            });
    };

    private generateLInk(role: string): string {
        return `${this.environment.config.baseUrl}/${role}#room=${this.props.name}`;
    }

    private renderClientStatus(room: RoomModel, side: string) {
        const isAvailable = Maybe(room).pluck(`state.${side}.isConnected`).getOrElse(false);
        const userName = Maybe(room).pluck(`state.${side}.name`).getOrElse('--Без имени--');

        if (isAvailable) {
            return (
                <div>
                    <div class={`client ${side}`}>
                        <div class="client-connection active" />
                        <div class="client-status wait">
                            Пишет код
                        </div>
                        <div class="client-name">
                            {userName}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div class={`client ${side}`}>
                    <div class="client-connection " />
                    <div class="client-status wait">
                        Оффлайн
                    </div>
                    <div class="client-name">
                        {userName}
                    </div>
                </div>
                <div>
                    <a href={this.generateLInk(side)} target="_blank">В бой!</a>
                </div>
            </div>
        );
    }
}