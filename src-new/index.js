import { supportsPushState } from './utils';
import { setBackward  } from './history-stack';
import NavComponent from './Navigation';
import { has } from './history-stack';
export default {
    install: (Vue, { router }) => {

        const event = router.mode === "history" ?  'popstate'
            : router.mode === 'hash' ? (supportsPushState ? 'popstate' : 'hashchange')
            : null;
        if(!event)
            throw 'router mode has to be history or hash!'


        window.addEventListener(event, e => {
            // means now go back!
            console.log(window.history.state && window.history.state.key, e.state && e.state.key)
            if(has((vnode) =>  vnode.cloudNavKey ===(e.state && e.state.key))){
                console.log('set setBackward', e)
                setBackward();
            }

        });
        Vue.component('navigation', NavComponent)
    }
}