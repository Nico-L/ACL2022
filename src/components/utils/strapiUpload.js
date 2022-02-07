function progress (e) {
    console.log('poregress', e)
}
export default function (blob, token, data) {
        console.log('token', token)
        const url = `https://cms.labonnefabrique.fr/acl-images`;
        const request = new XMLHttpRequest();
        const formData = new FormData();

        request.addEventListener('progress', progress);

        request.open('POST', url);
        request.setRequestHeader('Authorization', 'Bearer ' + token);
        formData.append('files.image', blob, data.titre);
        formData.append('data', JSON.stringify(data))
        request.send(formData);
}