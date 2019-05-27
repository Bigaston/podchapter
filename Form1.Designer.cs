namespace PodChapter
{
    partial class PodChapter
    {
        /// <summary>
        /// Variable nécessaire au concepteur.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Nettoyage des ressources utilisées.
        /// </summary>
        /// <param name="disposing">true si les ressources managées doivent être supprimées ; sinon, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Code généré par le Concepteur Windows Form

        /// <summary>
        /// Méthode requise pour la prise en charge du concepteur - ne modifiez pas
        /// le contenu de cette méthode avec l'éditeur de code.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.btnFolder = new System.Windows.Forms.Button();
            this.lblFolder = new System.Windows.Forms.Label();
            this.btnValide = new System.Windows.Forms.Button();
            this.openFileDialog = new System.Windows.Forms.OpenFileDialog();
            this.errorProvider = new System.Windows.Forms.ErrorProvider(this.components);
            this.openFileDialogChapitres = new System.Windows.Forms.OpenFileDialog();
            this.tabData = new System.Windows.Forms.TabPage();
            this.lblMetaTitre = new System.Windows.Forms.Label();
            this.txtMetaTitre = new System.Windows.Forms.TextBox();
            this.lblMetaArtiste = new System.Windows.Forms.Label();
            this.txtMetaArtiste = new System.Windows.Forms.TextBox();
            this.lblMetaAlbum = new System.Windows.Forms.Label();
            this.txtMetaAlbum = new System.Windows.Forms.TextBox();
            this.lblMetaGenre = new System.Windows.Forms.Label();
            this.txtMetaGenre = new System.Windows.Forms.TextBox();
            this.lblMetaPiste = new System.Windows.Forms.Label();
            this.txtMetaPiste = new System.Windows.Forms.TextBox();
            this.lblMetaAnnee = new System.Windows.Forms.Label();
            this.txtMetaAnnee = new System.Windows.Forms.TextBox();
            this.lblMetaCom = new System.Windows.Forms.Label();
            this.txtMetaCom = new System.Windows.Forms.TextBox();
            this.tabChapitres = new System.Windows.Forms.TabPage();
            this.btnOpenChapter = new System.Windows.Forms.Button();
            this.btnAddChapter = new System.Windows.Forms.Button();
            this.pnlChapitres = new System.Windows.Forms.Panel();
            this.tacMetadata = new System.Windows.Forms.TabControl();
            ((System.ComponentModel.ISupportInitialize)(this.errorProvider)).BeginInit();
            this.tabData.SuspendLayout();
            this.tabChapitres.SuspendLayout();
            this.tacMetadata.SuspendLayout();
            this.SuspendLayout();
            // 
            // btnFolder
            // 
            this.btnFolder.Location = new System.Drawing.Point(95, 13);
            this.btnFolder.Margin = new System.Windows.Forms.Padding(4);
            this.btnFolder.Name = "btnFolder";
            this.btnFolder.Size = new System.Drawing.Size(234, 34);
            this.btnFolder.TabIndex = 0;
            this.btnFolder.Text = "Choisir votre fichier .MP3";
            this.btnFolder.UseVisualStyleBackColor = true;
            this.btnFolder.Click += new System.EventHandler(this.BtnFolder_Click);
            // 
            // lblFolder
            // 
            this.lblFolder.Location = new System.Drawing.Point(12, 51);
            this.lblFolder.Name = "lblFolder";
            this.lblFolder.Size = new System.Drawing.Size(406, 38);
            this.lblFolder.TabIndex = 1;
            this.lblFolder.Text = "Aucun fichier choisis";
            this.lblFolder.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // btnValide
            // 
            this.btnValide.Location = new System.Drawing.Point(114, 445);
            this.btnValide.Name = "btnValide";
            this.btnValide.Size = new System.Drawing.Size(234, 32);
            this.btnValide.TabIndex = 2;
            this.btnValide.Text = "Encoder";
            this.btnValide.UseVisualStyleBackColor = true;
            this.btnValide.Visible = false;
            this.btnValide.Click += new System.EventHandler(this.BtnValide_Click);
            // 
            // openFileDialog
            // 
            this.openFileDialog.FileName = "audio.mp3";
            this.openFileDialog.Filter = "Fichier audio (*.mp3)|*.mp3";
            // 
            // errorProvider
            // 
            this.errorProvider.ContainerControl = this;
            // 
            // openFileDialogChapitres
            // 
            this.openFileDialogChapitres.FileName = "Piste de marqueurs.txt";
            this.openFileDialogChapitres.Filter = "Piste de marqueurs (*.txt)|*.txt";
            // 
            // tabData
            // 
            this.tabData.Controls.Add(this.txtMetaCom);
            this.tabData.Controls.Add(this.txtMetaAnnee);
            this.tabData.Controls.Add(this.txtMetaPiste);
            this.tabData.Controls.Add(this.txtMetaGenre);
            this.tabData.Controls.Add(this.txtMetaAlbum);
            this.tabData.Controls.Add(this.txtMetaArtiste);
            this.tabData.Controls.Add(this.txtMetaTitre);
            this.tabData.Controls.Add(this.lblMetaCom);
            this.tabData.Controls.Add(this.lblMetaAnnee);
            this.tabData.Controls.Add(this.lblMetaPiste);
            this.tabData.Controls.Add(this.lblMetaGenre);
            this.tabData.Controls.Add(this.lblMetaAlbum);
            this.tabData.Controls.Add(this.lblMetaArtiste);
            this.tabData.Controls.Add(this.lblMetaTitre);
            this.tabData.Location = new System.Drawing.Point(4, 28);
            this.tabData.Name = "tabData";
            this.tabData.Padding = new System.Windows.Forms.Padding(3);
            this.tabData.Size = new System.Drawing.Size(416, 315);
            this.tabData.TabIndex = 1;
            this.tabData.Text = "Autres métadonnés";
            this.tabData.UseVisualStyleBackColor = true;
            // 
            // lblMetaTitre
            // 
            this.lblMetaTitre.AutoSize = true;
            this.lblMetaTitre.Location = new System.Drawing.Point(6, 9);
            this.lblMetaTitre.Name = "lblMetaTitre";
            this.lblMetaTitre.Size = new System.Drawing.Size(50, 19);
            this.lblMetaTitre.TabIndex = 0;
            this.lblMetaTitre.Text = "Titre :";
            // 
            // txtMetaTitre
            // 
            this.txtMetaTitre.Location = new System.Drawing.Point(121, 6);
            this.txtMetaTitre.Name = "txtMetaTitre";
            this.txtMetaTitre.Size = new System.Drawing.Size(277, 27);
            this.txtMetaTitre.TabIndex = 1;
            this.txtMetaTitre.Tag = "title";
            // 
            // lblMetaArtiste
            // 
            this.lblMetaArtiste.AutoSize = true;
            this.lblMetaArtiste.Location = new System.Drawing.Point(6, 42);
            this.lblMetaArtiste.Name = "lblMetaArtiste";
            this.lblMetaArtiste.Size = new System.Drawing.Size(69, 19);
            this.lblMetaArtiste.TabIndex = 2;
            this.lblMetaArtiste.Text = "Artiste : ";
            // 
            // txtMetaArtiste
            // 
            this.txtMetaArtiste.Location = new System.Drawing.Point(121, 39);
            this.txtMetaArtiste.Name = "txtMetaArtiste";
            this.txtMetaArtiste.Size = new System.Drawing.Size(277, 27);
            this.txtMetaArtiste.TabIndex = 3;
            this.txtMetaArtiste.Tag = "artist";
            // 
            // lblMetaAlbum
            // 
            this.lblMetaAlbum.AutoSize = true;
            this.lblMetaAlbum.Location = new System.Drawing.Point(6, 76);
            this.lblMetaAlbum.Name = "lblMetaAlbum";
            this.lblMetaAlbum.Size = new System.Drawing.Size(63, 19);
            this.lblMetaAlbum.TabIndex = 4;
            this.lblMetaAlbum.Text = "Album :";
            // 
            // txtMetaAlbum
            // 
            this.txtMetaAlbum.Location = new System.Drawing.Point(121, 73);
            this.txtMetaAlbum.Name = "txtMetaAlbum";
            this.txtMetaAlbum.Size = new System.Drawing.Size(277, 27);
            this.txtMetaAlbum.TabIndex = 5;
            this.txtMetaAlbum.Tag = "album";
            // 
            // lblMetaGenre
            // 
            this.lblMetaGenre.AutoSize = true;
            this.lblMetaGenre.Location = new System.Drawing.Point(6, 109);
            this.lblMetaGenre.Name = "lblMetaGenre";
            this.lblMetaGenre.Size = new System.Drawing.Size(60, 19);
            this.lblMetaGenre.TabIndex = 6;
            this.lblMetaGenre.Text = "Genre :";
            // 
            // txtMetaGenre
            // 
            this.txtMetaGenre.Location = new System.Drawing.Point(121, 106);
            this.txtMetaGenre.Name = "txtMetaGenre";
            this.txtMetaGenre.Size = new System.Drawing.Size(277, 27);
            this.txtMetaGenre.TabIndex = 7;
            this.txtMetaGenre.Tag = "genre";
            // 
            // lblMetaPiste
            // 
            this.lblMetaPiste.AutoSize = true;
            this.lblMetaPiste.Location = new System.Drawing.Point(6, 143);
            this.lblMetaPiste.Name = "lblMetaPiste";
            this.lblMetaPiste.Size = new System.Drawing.Size(74, 19);
            this.lblMetaPiste.TabIndex = 8;
            this.lblMetaPiste.Text = "N° piste :";
            // 
            // txtMetaPiste
            // 
            this.txtMetaPiste.Location = new System.Drawing.Point(121, 140);
            this.txtMetaPiste.Name = "txtMetaPiste";
            this.txtMetaPiste.Size = new System.Drawing.Size(277, 27);
            this.txtMetaPiste.TabIndex = 9;
            this.txtMetaPiste.Tag = "track";
            // 
            // lblMetaAnnee
            // 
            this.lblMetaAnnee.AutoSize = true;
            this.lblMetaAnnee.Location = new System.Drawing.Point(6, 177);
            this.lblMetaAnnee.Name = "lblMetaAnnee";
            this.lblMetaAnnee.Size = new System.Drawing.Size(62, 19);
            this.lblMetaAnnee.TabIndex = 10;
            this.lblMetaAnnee.Tag = "date";
            this.lblMetaAnnee.Text = "Année :";
            // 
            // txtMetaAnnee
            // 
            this.txtMetaAnnee.Location = new System.Drawing.Point(121, 174);
            this.txtMetaAnnee.Name = "txtMetaAnnee";
            this.txtMetaAnnee.Size = new System.Drawing.Size(277, 27);
            this.txtMetaAnnee.TabIndex = 11;
            // 
            // lblMetaCom
            // 
            this.lblMetaCom.AutoSize = true;
            this.lblMetaCom.Location = new System.Drawing.Point(3, 211);
            this.lblMetaCom.Name = "lblMetaCom";
            this.lblMetaCom.Size = new System.Drawing.Size(112, 19);
            this.lblMetaCom.TabIndex = 12;
            this.lblMetaCom.Text = "Commentaire :";
            // 
            // txtMetaCom
            // 
            this.txtMetaCom.Location = new System.Drawing.Point(121, 208);
            this.txtMetaCom.Name = "txtMetaCom";
            this.txtMetaCom.Size = new System.Drawing.Size(277, 27);
            this.txtMetaCom.TabIndex = 13;
            this.txtMetaCom.Tag = "comment";
            // 
            // tabChapitres
            // 
            this.tabChapitres.Controls.Add(this.pnlChapitres);
            this.tabChapitres.Controls.Add(this.btnAddChapter);
            this.tabChapitres.Controls.Add(this.btnOpenChapter);
            this.tabChapitres.Location = new System.Drawing.Point(4, 28);
            this.tabChapitres.Name = "tabChapitres";
            this.tabChapitres.Padding = new System.Windows.Forms.Padding(3);
            this.tabChapitres.Size = new System.Drawing.Size(416, 315);
            this.tabChapitres.TabIndex = 0;
            this.tabChapitres.Text = "Chapitres";
            this.tabChapitres.UseVisualStyleBackColor = true;
            // 
            // btnOpenChapter
            // 
            this.btnOpenChapter.Location = new System.Drawing.Point(204, 277);
            this.btnOpenChapter.Name = "btnOpenChapter";
            this.btnOpenChapter.Size = new System.Drawing.Size(194, 32);
            this.btnOpenChapter.TabIndex = 3;
            this.btnOpenChapter.Text = "Importer les chapitres";
            this.btnOpenChapter.UseVisualStyleBackColor = true;
            this.btnOpenChapter.Click += new System.EventHandler(this.BtnOpenChapter_Click);
            // 
            // btnAddChapter
            // 
            this.btnAddChapter.Location = new System.Drawing.Point(10, 277);
            this.btnAddChapter.Name = "btnAddChapter";
            this.btnAddChapter.Size = new System.Drawing.Size(188, 32);
            this.btnAddChapter.TabIndex = 1;
            this.btnAddChapter.Text = "Ajouter un chapitre";
            this.btnAddChapter.UseVisualStyleBackColor = true;
            this.btnAddChapter.Click += new System.EventHandler(this.BtnAddChapter_Click);
            // 
            // pnlChapitres
            // 
            this.pnlChapitres.AutoScroll = true;
            this.pnlChapitres.Location = new System.Drawing.Point(3, 6);
            this.pnlChapitres.Name = "pnlChapitres";
            this.pnlChapitres.Size = new System.Drawing.Size(407, 265);
            this.pnlChapitres.TabIndex = 0;
            // 
            // tacMetadata
            // 
            this.tacMetadata.Controls.Add(this.tabChapitres);
            this.tacMetadata.Controls.Add(this.tabData);
            this.tacMetadata.Location = new System.Drawing.Point(16, 92);
            this.tacMetadata.Name = "tacMetadata";
            this.tacMetadata.SelectedIndex = 0;
            this.tacMetadata.Size = new System.Drawing.Size(424, 347);
            this.tacMetadata.TabIndex = 3;
            this.tacMetadata.Visible = false;
            // 
            // PodChapter
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(9F, 19F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(449, 488);
            this.Controls.Add(this.tacMetadata);
            this.Controls.Add(this.btnValide);
            this.Controls.Add(this.lblFolder);
            this.Controls.Add(this.btnFolder);
            this.Font = new System.Drawing.Font("Lato", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "PodChapter";
            this.Text = "PodChapter";
            this.Load += new System.EventHandler(this.PodChapter_Load);
            ((System.ComponentModel.ISupportInitialize)(this.errorProvider)).EndInit();
            this.tabData.ResumeLayout(false);
            this.tabData.PerformLayout();
            this.tabChapitres.ResumeLayout(false);
            this.tacMetadata.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.Button btnFolder;
        private System.Windows.Forms.Label lblFolder;
        private System.Windows.Forms.OpenFileDialog openFileDialog;
        private System.Windows.Forms.ErrorProvider errorProvider;
        private System.Windows.Forms.Button btnValide;
        private System.Windows.Forms.OpenFileDialog openFileDialogChapitres;
        private System.Windows.Forms.TabControl tacMetadata;
        private System.Windows.Forms.TabPage tabChapitres;
        private System.Windows.Forms.Panel pnlChapitres;
        private System.Windows.Forms.Button btnAddChapter;
        private System.Windows.Forms.Button btnOpenChapter;
        private System.Windows.Forms.TabPage tabData;
        private System.Windows.Forms.TextBox txtMetaCom;
        private System.Windows.Forms.TextBox txtMetaAnnee;
        private System.Windows.Forms.TextBox txtMetaPiste;
        private System.Windows.Forms.TextBox txtMetaGenre;
        private System.Windows.Forms.TextBox txtMetaAlbum;
        private System.Windows.Forms.TextBox txtMetaArtiste;
        private System.Windows.Forms.TextBox txtMetaTitre;
        private System.Windows.Forms.Label lblMetaCom;
        private System.Windows.Forms.Label lblMetaAnnee;
        private System.Windows.Forms.Label lblMetaPiste;
        private System.Windows.Forms.Label lblMetaGenre;
        private System.Windows.Forms.Label lblMetaAlbum;
        private System.Windows.Forms.Label lblMetaArtiste;
        private System.Windows.Forms.Label lblMetaTitre;
    }
}

