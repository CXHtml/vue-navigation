import { isBackward, pop, prePush, setForward, push } from './history-stack';
export default {
    name: 'navigation',
    render() {
        const vnode = this.$slots.default ? this.$slots.default[0] : null
        if (vnode) {
            console.log(isBackward());
            if (isBackward()) {
                vnode.componentInstance = pop().componentInstance;
            }else{
                push(vnode)
                this.$nextTick(() => {
                    console.log(window.history.state)
                    vnode.cloudNavKey = window.history.state && window.history.state.key;
                })
            }
            vnode.data.keepAlive = true
        }
        setForward();

        return vnode
    }
}