const fs = require('fs')
const path = require('path')
const { directoryPath, outPath, extension } = require('./config')

const base = 0xff
const next = 0xd8
const gifA = 0x47
const gifB = 0x49
const pngA = 0x89
const pngB = 0x50

//读取目录下所有.dat文件
function getAllFilesWithExtension(directoryPath, extension, fileList = []) {
  const files = fs.readdirSync(directoryPath)

  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isFile() && path.extname(file) === extension) {
      fileList.push(filePath)
    } else if (fileStat.isDirectory()) {
      getAllFilesWithExtension(filePath, extension, fileList)
    }
  }

  return fileList
}

const filesList = getAllFilesWithExtension(directoryPath, extension)
const filterFilesLists = filesList.filter((file) => file.includes('Image'))

console.log('Files with extension .dat:')
for (let i = 0; i < filterFilesLists.length; i++) {
  convert(filterFilesLists[i])
  process.stdout.write(`${i + 1}/${filterFilesLists.length} \r`)
}

//.dat转化为.jpg图片
function convert(item) {
  let fileName = path.parse(item).name
  let imgPath = path.join(outPath, fileName + '.jpg')
  fs.readFile(item, (_err, content) => {
    if (content?.length) {
      let firstV = content[0]
      let nextV = content[1]
      let jT = firstV ^ base
      let jB = nextV ^ next
      let gT = firstV ^ gifA
      let gB = nextV ^ gifB
      let pT = firstV ^ pngA
      let pB = nextV ^ pngB
      let v = firstV ^ base
      if (jT == jB) {
        v = jT
      } else if (gT == gB) {
        v = gT
      } else if (pT == pB) {
        v = pT
      }

      let bb = content.map((br) => {
        return br ^ v
      })
      fs.writeFileSync(imgPath, bb)
    }
  })
}
