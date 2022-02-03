const languages = ["en"]
let language;

if(languages.includes(navigator.language)) language = navigator.language
else if(languages.includes(navigator.language.split("-")[0])) language = navigator.language.split("-")[0]
else language = "en"

export default Object.assign({language}, await import("./strings/"+language+".js"));
