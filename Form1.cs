using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Diagnostics;

namespace PodChapter
{
    public partial class PodChapter : Form
    {
        public PodChapter()
        {
            InitializeComponent();
        }

        private void PodChapter_Load(object sender, EventArgs e)
        {
            
        }

        int nb_chapitres = 0;

        private void BtnFolder_Click(object sender, EventArgs e)
        {
            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                lblFolder.Text = openFileDialog.FileName;
                tacMetadata.Visible = true;
                btnValide.Visible = true;
            }
        }

        private void BtnAddChapter_Click(object sender, EventArgs e)
        {
            Label lb = new Label();
            lb.Text = (nb_chapitres + 1).ToString();
            lb.Top = nb_chapitres * 30;
            lb.AutoSize = true;
            lb.Tag = (nb_chapitres + 1).ToString();

            TextBox tx1 = new TextBox();
            tx1.Left = 27;
            tx1.Size = new System.Drawing.Size(212, 27);
            tx1.Tag = (nb_chapitres + 1).ToString();
            tx1.Top = nb_chapitres * 30;
            tx1.Text = "Chapitre " + (nb_chapitres + 1).ToString();

            TextBox tx2 = new TextBox();
            tx2.Left = 245;
            tx2.Size = new System.Drawing.Size(25, 27);
            tx2.Tag = (nb_chapitres + 1).ToString();
            tx2.Top = nb_chapitres * 30;
            tx2.Text = "00";
            tx2.KeyPress += new KeyPressEventHandler(keyPressH);
                       
            TextBox tx3 = new TextBox();
            tx3.Left = 270;
            tx3.Size = new System.Drawing.Size(25, 27);
            tx3.Tag = (nb_chapitres + 1).ToString();
            tx3.Top = nb_chapitres * 30;
            tx3.Text = "00";
            tx3.KeyPress += new KeyPressEventHandler(keyPressM);


            TextBox tx4 = new TextBox();
            tx4.Left = 295;
            tx4.Size = new System.Drawing.Size(25, 27);
            tx4.Tag = (nb_chapitres + 1).ToString();
            tx4.Top = nb_chapitres * 30;
            tx4.Text = "00";
            tx4.KeyPress += new KeyPressEventHandler(keyPressS);

            Button btn = new Button();
            btn.Left = 322;
            btn.Size = new System.Drawing.Size(32, 27);
            btn.Tag = (nb_chapitres + 1).ToString();
            btn.Top = nb_chapitres * 30;
            btn.Text = "-";
            btn.Click += new System.EventHandler(btnDelete);

            pnlChapitres.Controls.Add(lb);
            pnlChapitres.Controls.Add(tx1);
            pnlChapitres.Controls.Add(tx2);
            pnlChapitres.Controls.Add(tx3);
            pnlChapitres.Controls.Add(tx4);
            pnlChapitres.Controls.Add(btn);

            foreach (Control con in pnlChapitres.Controls)
            {
                if (con is Button && con.Tag.Equals((nb_chapitres).ToString()))
                {
                    ((Button)con).Enabled = false;
                }

            }

            nb_chapitres++;
        }

        private void btnDelete(object sender, EventArgs e)
        {
            Button btn = (Button)sender;
            string nb = btn.Tag.ToString();

            for (int i = 0; i < pnlChapitres.Controls.Count; i++)
            {
                if (pnlChapitres.Controls[i].Tag.ToString() == nb)
                {
                    pnlChapitres.Controls.RemoveAt(i);
                    i--;
                }
            }

            nb_chapitres--;

            foreach (Control con in pnlChapitres.Controls)
            {
                if (con is Button && con.Tag.Equals((nb_chapitres).ToString()))
                {
                    ((Button)con).Enabled = true;
                }

            }
        }

        private void keyPressH(object sender, KeyPressEventArgs e)
        {
            e.Handled = true;
            TextBox txt = (TextBox)sender;

            if (char.IsNumber(e.KeyChar))
            {
                e.Handled = false;
                if (txt.Text.Length == 1)
                {
                    this.GetNextControl((Control)sender, true).Focus();
                }
            } else if (e.KeyChar == (char)Keys.Back)
            {
                e.Handled = false;

            }
        }

        private void keyPressM(object sender, KeyPressEventArgs e)
        {
            e.Handled = true;
            TextBox txt = (TextBox)sender;

            if (char.IsNumber(e.KeyChar))
            {
                e.Handled = false;
                if (txt.Text.Length == 1)
                {
                    this.GetNextControl((Control)sender, true).Focus();
                }
            }
            else if (e.KeyChar == (char)Keys.Back)
            {
                e.Handled = false;

            }
        }

        private void keyPressS(object sender, KeyPressEventArgs e)
        {
            e.Handled = true;

            if (char.IsNumber(e.KeyChar) || e.KeyChar == (char)Keys.Back)
            {
                e.Handled = false;
            }
        }

        private void BtnValide_Click(object sender, EventArgs e)
        {
            bool err = false;
            foreach (Control con in pnlChapitres.Controls)
            {
                if (con is TextBox && con.Width == 25 && con.Left != 245)
                {
                    if (int.Parse(((TextBox)con).Text) < 0 || int.Parse(((TextBox)con).Text) > 59)
                    {
                        con.BackColor = Color.OrangeRed;
                        err = true;
                    } else
                    {
                        con.BackColor = Color.White;
                        err = false;
                    }
                }
            }

            if (err)
            {
                errorProvider.SetError(btnValide, "La valeur des heures et minutes doivent être comprisent entre 0 et 59!");
            } else
            {
                errorProvider.SetError(btnValide, "");
                startCreation();
            }
        }

        private void startCreation()
        {
            string chapter_string = ";FFMETADATA1" + System.Environment.NewLine;

            foreach (Control cont in tabData.Controls)
            {
                if (cont is TextBox)
                {
                    chapter_string += cont.Tag + "=" + cont.Text;
                }
            }

            int nb = 0;
            string title = "";

            foreach (Control con in pnlChapitres.Controls)
            {

                if (con is TextBox)
                {
                    if (con.Width != 25)
                    {
                        title = con.Text.ToString();
                        nb = 0;
                    }
                    else
                    {
                        if (con.Left == 245)
                        {
                            nb += int.Parse(con.Text) * 60 * 60 * 1000;
                        }
                        else if (con.Left == 270)
                        {
                            nb += int.Parse(con.Text) * 60 * 1000;

                        }
                        else if (con.Left == 295)
                        {
                            nb += int.Parse(con.Text) * 1000;
                            chapter_string = chapter_string + @"
[CHAPTER]" + System.Environment.NewLine +
"TIMEBASE=1/1000" + System.Environment.NewLine +
"START=" + nb + System.Environment.NewLine + 
"END=" + (nb+1000) + System.Environment.NewLine +
"title=" + title + System.Environment.NewLine;
                        }
                    }
                }
            }

            File.Copy(lblFolder.Text, Directory.GetCurrentDirectory() + "\\audioin.mp3", true);
            File.Delete("metadata.txt");

            Process proc = new Process();
            proc.StartInfo.WorkingDirectory = Directory.GetCurrentDirectory();
            //proc.StartInfo.FileName = "get_meta.bat";
            proc.StartInfo.CreateNoWindow = true;
            //proc.Start();
            //proc.WaitForExit();

            File.WriteAllText("metadata.txt", chapter_string);

            proc.StartInfo.FileName = "add_meta.bat";
            proc.Start();
            proc.WaitForExit();
            File.Copy(Directory.GetCurrentDirectory() + "\\audioout.mp3", lblFolder.Text.Replace(".mp3", "_OUT.mp3"));
            File.Delete("audioin.mp3");
            File.Delete("audioout.mp3");
            File.Delete("metadata.txt");
            MessageBox.Show("Métadonnés ajoutés avec succès!");
            
        }

        private void BtnOpenChapter_Click(object sender, EventArgs e)
        {
            if (openFileDialogChapitres.ShowDialog() == DialogResult.OK)
            {
                string fichier = openFileDialogChapitres.FileName;

                string[] lignes = File.ReadAllText(fichier).Split(new[] { "\r\n", "\r", "\n" },StringSplitOptions.None);

                for (int i = 0; i < lignes.Length-1; i++)
                {
                    string[] partie = lignes[i].Split(Convert.ToChar(9));
                    TimeSpan t = TimeSpan.FromSeconds(double.Parse(partie[0].Replace(".",",")));

                    Label lb = new Label();
                    lb.Text = (nb_chapitres + 1).ToString();
                    lb.Top = nb_chapitres * 30;
                    lb.AutoSize = true;
                    lb.Tag = (nb_chapitres + 1).ToString();

                    TextBox tx1 = new TextBox();
                    tx1.Left = 27;
                    tx1.Size = new System.Drawing.Size(212, 27);
                    tx1.Tag = (nb_chapitres + 1).ToString();
                    tx1.Top = nb_chapitres * 30;
                    tx1.Text = partie[2];

                    TextBox tx2 = new TextBox();
                    tx2.Left = 245;
                    tx2.Size = new System.Drawing.Size(25, 27);
                    tx2.Tag = (nb_chapitres + 1).ToString();
                    tx2.Top = nb_chapitres * 30;
                    tx2.Text = t.Hours.ToString();
                    tx2.KeyPress += new KeyPressEventHandler(keyPressH);

                    TextBox tx3 = new TextBox();
                    tx3.Left = 270;
                    tx3.Size = new System.Drawing.Size(25, 27);
                    tx3.Tag = (nb_chapitres + 1).ToString();
                    tx3.Top = nb_chapitres * 30;
                    tx3.Text = t.Minutes.ToString();
                    tx3.KeyPress += new KeyPressEventHandler(keyPressM);


                    TextBox tx4 = new TextBox();
                    tx4.Left = 295;
                    tx4.Size = new System.Drawing.Size(25, 27);
                    tx4.Tag = (nb_chapitres + 1).ToString();
                    tx4.Top = nb_chapitres * 30;
                    tx4.Text = t.Seconds.ToString(); ;
                    tx4.KeyPress += new KeyPressEventHandler(keyPressS);

                    Button btn = new Button();
                    btn.Left = 322;
                    btn.Size = new System.Drawing.Size(32, 27);
                    btn.Tag = (nb_chapitres + 1).ToString();
                    btn.Top = nb_chapitres * 30;
                    btn.Text = "-";
                    btn.Click += new System.EventHandler(btnDelete);

                    pnlChapitres.Controls.Add(lb);
                    pnlChapitres.Controls.Add(tx1);
                    pnlChapitres.Controls.Add(tx2);
                    pnlChapitres.Controls.Add(tx3);
                    pnlChapitres.Controls.Add(tx4);
                    pnlChapitres.Controls.Add(btn);

                    foreach (Control con in pnlChapitres.Controls)
                    {
                        if (con is Button && con.Tag.Equals((nb_chapitres).ToString()))
                        {
                            ((Button)con).Enabled = false;
                        }

                    }

                    nb_chapitres++;
                }

                MessageBox.Show("Chapitres importés depuis Audacity!");
            }
        }
    }
}
