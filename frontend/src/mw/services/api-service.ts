import {RestApi} from "../platform";

const restApi = new RestApi('app2');

class ApiService {

  async checkPanelAnswerStatus(session: string) {
    return restApi.$get<{ status: boolean }>(`/panel/${session}/answer/status`);
  }

  async askPanel(body: AskPanelBody) {
    return restApi.$post('/panel/ask', body);
  }

  async login(body: { name: string, id: string }) {
    return restApi.$post('/user/login', body);
  }

  createUser(body: { name: string }) {
    return restApi.$post('/user/create', body);
  }

  async createSession(uid: string) {
    return restApi.$post<string>('/gpt/session', { uid });
  }

  checkSynthesizerStatus(session: string) {
    return restApi.$get<{ status: boolean }>(`/panel/${session}/synth/status`);
  }

  askSynthesizer(session: string) {
    return restApi.$post<string>('/panel/synthesize', { session});
  }

}

export const apiService = new ApiService();

export type AskPanelBody = {
  question: string;
  session: string;
}