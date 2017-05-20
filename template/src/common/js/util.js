/**
 * Created by trigkit4 on 2017/5/9.
 */

let util = {

    ajax(options,success,error){
        if (typeof options === 'string') {
            options = {
                url: options
            }
        }
        let defaultConfig = {
            dataType: 'json',
            type: options.type || 'GET',
            url: options.url,
            data: {
                request: JSON.stringify(options.data || {})
            },
            beforeSend(xhr){
                xhr.withCredentials = true;
            },
            success(data){
                success && success(data);
            },
            error(){
                error && error();
            }
        };
        $.ajax(defaultConfig);
    }
};
export default util;
